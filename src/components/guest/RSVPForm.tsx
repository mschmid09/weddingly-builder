import { useState, useId } from 'react';
import { Check, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const rsvpSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal('')),
  attending: z.enum(['yes', 'no'], {
    errorMap: () => ({ message: 'Please let us know if you can attend.' }),
  }),
  dietaryRestrictions: z.string().optional(),
  message: z.string().optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPFormProps {
  siteSlug: string;
  primaryColor?: string;
  accentColor?: string;
  guestName?: string;
}

export function RSVPForm({
  siteSlug,
  primaryColor = '#e4b6c6',
  accentColor = '#9b7e7e',
  guestName,
}: RSVPFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formId = useId();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      fullName: guestName || '',
    },
  });

  const attending = watch('attending');

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/rsvp/${siteSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          attending: data.attending === 'yes',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit RSVP');
      }

      setSubmitted(true);
      toast.success('RSVP submitted successfully!');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to submit RSVP';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="guest-rsvp-confirmation text-center py-12 px-4" role="status">
        <div className="max-w-md mx-auto">
          <Check size={28} strokeWidth={1} className="mx-auto mb-6" aria-hidden="true" />
          <h3
            className="text-2xl mb-2"
          >
            Your reply is on its way.
          </h3>
          <p className="text-gray-600">
            {attending === 'yes' ? "Thank you. We can't wait to celebrate with you." : "Thank you for letting us know. You'll be there in spirit."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor={`${formId}-name`} className="block text-sm font-medium mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('fullName')}
          id={`${formId}-name`}
          autoComplete="name"
          placeholder="Your full name"
          className="w-full"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor={`${formId}-email`} className="block text-sm font-medium mb-2">
          Email (Optional)
        </label>
        <Input
          {...register('email')}
          id={`${formId}-email`}
          autoComplete="email"
          type="email"
          placeholder="your@email.com"
          className="w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Attending */}
      <fieldset>
        <legend className="block text-sm font-medium mb-3">
          Will you be attending?{' '}
          <span className="text-red-500">*</span>
        </legend>
        <div className="flex gap-4">
          <label className="flex items-center flex-1">
            <input
              {...register('attending')}
              type="radio"
              value="yes"
              className="mr-2 h-4 w-4"
              style={{ accentColor }}
            />
            <span className="text-sm">Yes, I'll be there!</span>
          </label>
          <label className="flex items-center flex-1">
            <input
              {...register('attending')}
              type="radio"
              value="no"
              className="mr-2 h-4 w-4"
              style={{ accentColor }}
            />
            <span className="text-sm">Sorry, can't make it</span>
          </label>
        </div>
        {errors.attending && (
          <p className="text-red-500 text-sm mt-1">
            {errors.attending.message}
          </p>
        )}
      </fieldset>

      {/* Dietary Restrictions - only show if attending */}
      {attending === 'yes' && (
        <div>
          <label htmlFor={`${formId}-dietary`} className="block text-sm font-medium mb-2">
            Dietary Restrictions (Optional)
          </label>
          <Input
            {...register('dietaryRestrictions')}
            id={`${formId}-dietary`}
            placeholder="Any allergies or dietary needs?"
            className="w-full"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor={`${formId}-message`} className="block text-sm font-medium mb-2">
          Message for the Couple (Optional)
        </label>
        <Textarea
          {...register('message')}
          id={`${formId}-message`}
          placeholder="Share your warm wishes..."
          className="w-full min-h-[100px]"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        style={{
          backgroundColor: accentColor,
        }}
      >
        <Send size={16} aria-hidden="true" />
        {isSubmitting ? 'Sending...' : 'Send reply'}
      </Button>
    </form>
  );
}
