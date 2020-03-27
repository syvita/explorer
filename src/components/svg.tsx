import * as React from 'react';
import { Box, BoxProps } from '@blockstack/ui';

export const CheckmarkCircleIcon: React.FC<BoxProps> = props => (
  <Box {...props}>
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none">
      <path
        d="M7.99613 16.9961C12.3809 16.9961 16 13.377 16 8.99996C16 4.61523 12.3731 0.996094 7.9884 0.996094C3.61141 0.996094 0 4.61523 0 8.99996C0 13.377 3.61914 16.9961 7.99613 16.9961ZM6.94442 13.0367C6.65056 13.0367 6.41856 12.9052 6.1943 12.6423L3.96713 9.92794C3.82794 9.75781 3.75834 9.56448 3.75834 9.37889C3.75834 8.96129 4.08313 8.64423 4.47753 8.64423C4.71725 8.64423 4.91832 8.74476 5.11165 8.97676L6.92122 11.2581L10.4089 5.69015C10.579 5.41175 10.8033 5.28029 11.043 5.28029C11.4297 5.28029 11.8009 5.55095 11.8009 5.96081C11.8009 6.14641 11.7081 6.33974 11.5998 6.50987L7.67134 12.6191C7.48574 12.8975 7.23828 13.0367 6.94442 13.0367Z"
        fill="currentColor"
      />
    </svg>
  </Box>
);

export const ExclamationMarkCircleIcon: React.FC<BoxProps> = props => (
  <Box {...props}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7.9983 4C8.46541 4 8.84049 4.38536 8.82787 4.8523L8.72037 8.82986C8.70981 9.22031 8.39026 9.53134 7.99967 9.53134C7.60928 9.53134 7.28981 9.2206 7.279 8.83036L7.16874 4.85287C7.15579 4.38572 7.53096 4 7.9983 4ZM8.9199 11.0743C8.91607 11.5873 8.49058 12 7.99992 12C7.49392 12 7.0761 11.5873 7.07993 11.0743C7.0761 10.569 7.49392 10.1562 7.99992 10.1562C8.49058 10.1562 8.91607 10.569 8.9199 11.0743Z"
        fill="currentColor"
      />
    </svg>
  </Box>
);