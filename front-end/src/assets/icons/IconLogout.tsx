import { customUnitFn } from '@/utils';
import * as React from 'react';
import { SVGProps } from 'react';
const IconLogout = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={customUnitFn(20)}
    height={customUnitFn(21)}
    viewBox='0 0 20 21'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      fill-rule='evenodd'
      clip-rule='evenodd'
      d='M10.8887 2.2027V10.1626C10.8887 11.1956 8.97168 11.1956 8.97168 10.1626V2.2027C8.97168 1.16974 10.8887 1.16974 10.8887 2.2027Z'
      fill='#F3394A'
    />
    <path
      fill-rule='evenodd'
      clip-rule='evenodd'
      d='M16.64 10.7703C16.64 8.15747 14.9874 6.03078 12.4754 5.05858C11.4838 4.69401 12.1449 2.99265 13.2025 3.41799C16.4417 4.69401 18.5571 7.42832 18.5571 10.7703C18.5571 15.1452 14.723 18.6694 9.89728 18.6694C5.13768 18.6694 1.23746 15.0844 1.30356 10.7095C1.30356 7.36756 3.48504 4.63324 6.65811 3.41799C7.7819 2.99265 8.44296 4.69401 7.38527 5.05858C4.93936 6.03078 3.22062 8.15747 3.22062 10.7703C3.22062 14.173 6.26147 16.9073 9.96338 16.9073C13.5992 16.9073 16.64 14.173 16.64 10.7703Z'
      fill='#F3394A'
    />
  </svg>
);
export default IconLogout;
