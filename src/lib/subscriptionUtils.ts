
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { DEFAULT_REQUEST_LIMIT } from './constants';

/**
 * Checks if a user has enough requests remaining
 */
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

/**
 * Returns the requests usage percentage
 */
export const calculateUsagePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 100; // Prevent division by zero
  return Math.min((used / limit) * 100, 100);
};

/**
 * Formats plan name for display
 */
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

/**
 * Returns days remaining in trial or subscription period
 */
export const getDaysRemainingInPlan = (endDate: any): number => {
  if (!endDate) return 0;
  
  // Convert Firestore timestamp to Date if needed
  const endDateTime = endDate.seconds ? 
    new Date(endDate.seconds * 1000) : 
    new Date(endDate);
    
  const now = new Date();
  const diffTime = endDateTime.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays); // Don't return negative days
};

/**
 * Suggests an upgrade based on current plan
 */
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
