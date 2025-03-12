import { VariantProps, cva } from 'class-variance-authority';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';

import { cn } from '~/lib/cn';

cssInterop(RNTextInput, { className: 'style' });

const textInputVariants = cva(
  'p-3 rounded-md bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border border-stone-200 dark:border-stone-700',
        filled: 'bg-stone-100 dark:bg-stone-800 border-transparent',
        unstyled: 'p-0 border-0 bg-transparent',
      },
      state: {
        default: '',
        error: 'border-red-500 dark:border-red-500',
        success: 'border-green-500 dark:border-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      state: 'default',
    },
  }
);

export interface TextInputProps extends RNTextInputProps, VariantProps<typeof textInputVariants> {
  className?: string;
}

const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  ({ className, variant, state, placeholderTextColor, ...props }, ref) => {
    return (
      <RNTextInput
        ref={ref}
        className={cn(textInputVariants({ variant, state }), className)}
        placeholderTextColor={placeholderTextColor || '#9CA3AF'}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';

export { TextInput, textInputVariants };
