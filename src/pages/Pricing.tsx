
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createSubscriptionCheckout, createFlexCheckout } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Check, Info, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { getStripePriceId } from '@/lib/subscriptionUtils';

const Pricing: React.FC = () => {
  // Set yearly as the default billing cycle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});

  const handlePurchase = async (plan: string, priceId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [plan]: true }));
      
      if (!currentUser) {
        // Redirect to signup if user is not logged in
        navigate('/signup', { state: { from: 'pricing', plan } });
        return;
      }

      if (plan === 'flexy') {
        const checkoutUrl = await createFlexCheckout(currentUser.uid, priceId);
        window.location.href = checkoutUrl;
      } else {
        const checkoutUrl = await createSubscriptionCheckout(currentUser.uid, priceId);
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: `Failed to create checkout: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [plan]: false }));
    }
  };

  const freeTrial = () => {
    if (!currentUser) {
      navigate('/signup', { state: { from: 'pricing', plan: 'trial' } });
      return;
    }
    
    // In a real implementation, we would call an API to activate the trial
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-20 fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Choose the plan that's right for you</p>
        
        {/* Billing cycle switch with yearly highlighted as default */}
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 mb-8">
          <button
            className={`py-2 px-4 rounded-full transition-colors duration-200 ${
              billingCycle === 'monthly' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`py-2 px-4 rounded-full transition-colors duration-200 ${
              billingCycle === 'yearly' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
          </button>
        </div>
        {billingCycle === 'yearly' && (
          <div className="text-sm text-green-500 font-medium mb-4">
            Save significantly with our yearly plans!
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Basic Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 flex-grow">
            <h3 className="text-xl font-bold mb-1">Basic Plan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Perfect for casual users managing a single social media platform.
            </p>
            <div className="mb-6">
              <span className="text-3xl font-bold">
                {billingCycle === 'monthly' ? '£9.99' : '£59.99'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {billingCycle === 'monthly' ? '/month' : '/year'}
              </span>
              {billingCycle === 'yearly' && (
                <div className="text-sm text-green-500 font-medium mt-1">
                  Save £59.89/year (~50%)
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">5 free requests during trial</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">
                  {billingCycle === 'monthly' ? '75 requests/month' : '900 requests/year'}
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Single platform support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Post ideas and captions (image only support)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Basic analytics</span>
              </li>
            </ul>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700">
            <Button 
              className="w-full mb-3" 
              variant="outline"
              onClick={() => handlePurchase(
                'basic', 
                getStripePriceId('basic', billingCycle)
              )}
              disabled={isLoading['basic']}
            >
              {isLoading['basic'] ? 'Processing...' : 'Choose Basic'}
            </Button>
            <Button 
              className="w-full" 
              onClick={freeTrial}
            >
              Start Free Trial
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              Start your 5-day trial with 5 free requests. Payment details required. Cancel anytime during the trial to avoid charges.
            </p>
          </div>
        </div>
        
        {/* Premium Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative flex flex-col">
          <div className="absolute top-0 right-0 left-0">
            <div className="bg-blue-600 text-white text-xs font-medium py-1 text-center rounded-t-lg">
              Most Popular
            </div>
          </div>
          <div className="p-6 pt-10 flex-grow">
            <h3 className="text-xl font-bold mb-1">Premium Plan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Ideal for small businesses managing multiple platforms.
            </p>
            <div className="mb-6">
              <span className="text-3xl font-bold">
                {billingCycle === 'monthly' ? '£59.99' : '£199.99'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {billingCycle === 'monthly' ? '/month' : '/year'}
              </span>
              {billingCycle === 'yearly' && (
                <div className="text-sm text-green-500 font-medium mt-1">
                  Save £519.89/year (~43%)
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">
                  {billingCycle === 'monthly' ? '250 requests/month' : '3000 requests/year'}
                </span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Multi-platform support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Advanced Post ideas and captions</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Multi-media support (image/video)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Custom templates</span>
              </li>
            </ul>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={() => handlePurchase(
                'premium', 
                getStripePriceId('premium', billingCycle)
              )}
              disabled={isLoading['premium']}
            >
              {isLoading['premium'] ? 'Processing...' : 'Choose Premium'}
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              Includes 5-day free trial. Payment details required, cancel anytime.
            </p>
          </div>
        </div>
        
        {/* Flex Add-On */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 flex-grow">
            <h3 className="text-xl font-bold mb-1">Flex Add-On</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Pay as you go option for additional content generations.
            </p>
            <div className="mb-6">
              <span className="text-3xl font-bold">£1.99</span>
              <span className="text-gray-500 dark:text-gray-400"> per pack</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">No monthly commitment</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Works with Basic or Premium plan</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Same features as your base plan</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">Usage analytics included</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">20 additional requests per pack</span>
              </li>
            </ul>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-700">
            <Button 
              className="w-full" 
              variant="default"
              onClick={() => handlePurchase('flexy', getStripePriceId('flexy', 'monthly'))}
              disabled={isLoading['flexy']}
            >
              {isLoading['flexy'] ? 'Processing...' : 'Add Flex Pack'}
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              One-time purchase, no subscription required.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">What's included in the free trial?</AccordionTrigger>
            <AccordionContent>
              All plans come with a 5-day free trial that includes 5 free requests. You can test all features available in your chosen plan during this period. Credit card details are required to start a trial.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">Can I change plans later?</AccordionTrigger>
            <AccordionContent>
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">How does the Flex Add-On work?</AccordionTrigger>
            <AccordionContent>
              The Flex Add-On allows you to purchase additional requests when you need them. Each purchase gives you 20 extra requests that never expire.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">How is billing handled?</AccordionTrigger>
            <AccordionContent>
              For monthly and yearly plans, you'll be billed automatically at the start of each billing cycle. You can cancel anytime before your next billing date.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">Do you offer refunds?</AccordionTrigger>
            <AccordionContent>
              We offer a 14-day money-back guarantee if you're not satisfied with your subscription. Contact our support team to process your refund.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Call to action */}
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of content creators and businesses who use EngagePerfect AI to create engaging content that resonates with their audience.
        </p>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
          onClick={freeTrial}
        >
          Start Your Free Trial Today
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
