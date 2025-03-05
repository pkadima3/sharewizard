import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { DEFAULT_REQUEST_LIMIT } from './constants';

export const checkUserRequestAvailability = async (userId: string): Promise<{
  canMakeRequest: boolean;
  requestsUsed: number;
  requestsLimit: number;
  planType: string;
}> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { 
        canMakeRequest: false, 
        requestsUsed: 0, 
        requestsLimit: 0,
        planType: 'free'
      };
    }

    const userData = userDoc.data();
    const requestsUsed = userData.requests_used || 0;
    const requestsLimit = userData.requests_limit || DEFAULT_REQUEST_LIMIT.free;
    const planType = userData.plan_type || 'free';
    
    return {
      canMakeRequest: requestsUsed < requestsLimit,
      requestsUsed,
      requestsLimit,
      planType
    };
  } catch (error) {
    console.error("Error checking request availability:", error);
    return { 
      canMakeRequest: false, 
      requestsUsed: 0, 
      requestsLimit: 0,
      planType: 'free'
    };
  }
};

export const checkUserPlan = async (userId: string): Promise<{
  status: 'OK' | 'UPGRADE' | 'LIMIT_REACHED';
  message: string;
  usagePercentage: number;
}> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { 
        status: 'UPGRADE', 
        message: 'User profile not found. Please contact support.',
        usagePercentage: 100
      };
    }

    const userData = userDoc.data();
    const requestsUsed = userData.requests_used || 0;
    const requestsLimit = userData.requests_limit || DEFAULT_REQUEST_LIMIT.free;
    const planType = userData.plan_type || 'free';
    const usagePercentage = calculateUsagePercentage(requestsUsed, requestsLimit);
    
    if (requestsUsed >= requestsLimit) {
      if (planType === 'free') {
        return {
          status: 'UPGRADE',
          message: 'You have used all your free requests. Start a trial or upgrade to continue.',
          usagePercentage
        };
      } else if (planType === 'trial') {
        return {
          status: 'UPGRADE',
          message: 'Your trial requests are used up. Upgrade to a paid plan to continue.',
          usagePercentage
        };
      } else if (planType === 'basic') {
        return {
          status: 'LIMIT_REACHED',
          message: 'You have reached your monthly request limit. Upgrade to Premium or add Flex packs.',
          usagePercentage
        };
      } else if (planType === 'premium') {
        return {
          status: 'LIMIT_REACHED',
          message: 'You have reached your monthly request limit. Add Flex packs for additional requests.',
          usagePercentage
        };
      } else if (planType === 'flexy') {
        return {
          status: 'LIMIT_REACHED',
          message: 'You have used all your Flex requests. Purchase more to continue.',
          usagePercentage
        };
      }
    }
    
    if (usagePercentage >= 80) {
      return {
        status: 'OK',
        message: `You're running low on requests (${requestsLimit - requestsUsed} left). Consider upgrading soon.`,
        usagePercentage
      };
    }
    
    return {
      status: 'OK',
      message: `You have ${requestsLimit - requestsUsed} requests remaining.`,
      usagePercentage
    };
  } catch (error: any) {
    console.error("Error checking user plan:", error);
    return { 
      status: 'UPGRADE', 
      message: `Error checking plan: ${error.message}`,
      usagePercentage: 0
    };
  }
};

export const calculateUsagePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 100;
  return Math.min((used / limit) * 100, 100);
};

export const formatPlanName = (planType: string): string => {
  switch (planType) {
    case 'free':
      return 'Free Plan';
    case 'trial':
      return 'Trial Plan';
    case 'basic':
      return 'Basic Plan';
    case 'premium':
      return 'Premium Plan';
    case 'flexy':
      return 'Flex Purchase';
    default:
      return 'Unknown Plan';
  }
};

export const getDaysRemainingInPlan = (endDate: any): number => {
  if (!endDate) return 0;
  
  const endDateTime = endDate.seconds ? 
    new Date(endDate.seconds * 1000) : 
    new Date(endDate);
    
  const now = new Date();
  const diffTime = endDateTime.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

export const getSuggestedUpgrade = (currentPlan: string): string => {
  switch (currentPlan) {
    case 'free':
      return 'Start your 5-day free trial to get 5 more requests.';
    case 'trial':
      return 'Your trial will end soon. Upgrade to Basic or Premium to continue.';
    case 'basic':
      return 'Upgrade to Premium for more requests (250/month) and advanced features.';
    case 'premium':
      return 'You\'re on our best plan! Need more? Add Flex packs for additional requests.';
    case 'flexy':
      return 'Need more requests? Purchase additional Flex packs anytime.';
    default:
      return 'Upgrade your plan to access more features.';
  }
};

export const resetUsageCounter = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      requests_used: 0
    });
    return true;
  } catch (error) {
    console.error("Error resetting usage counter:", error);
    return false;
  }
};

export const handleMidSessionLimitReaching = async (userId: string): Promise<boolean> => {
  const { canMakeRequest, requestsUsed, requestsLimit } = await checkUserRequestAvailability(userId);
  return requestsUsed === requestsLimit - 1;
};

export const addFlexRequests = async (userId: string, additionalRequests: number): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      requests_limit: increment(additionalRequests),
      plan_type: 'flexy'
    });
    return true;
  } catch (error) {
    console.error("Error adding flex requests:", error);
    return false;
  }
};
