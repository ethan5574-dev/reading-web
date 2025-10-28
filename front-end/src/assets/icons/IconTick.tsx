import { customUnitFn } from '@/utils';
import * as React from 'react';
import { SVGProps } from 'react';
const IconTick = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={customUnitFn(24)}
    height={customUnitFn(25)}
    viewBox='0 0 24 25'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M21.6249 5.04483C21.131 5.86803 20.3282 6.70851 19.4849 7.47627C15.3384 11.2548 11.8394 16.2485 9.74086 21.6041C9.61654 21.9214 9.17998 21.954 9.01366 21.6567C8.12446 20.0669 6.97006 18.6058 5.5639 17.4536C4.51078 16.4907 3.27382 16.2048 2.32294 15.1983C1.04254 13.843 2.36254 12.686 3.61702 12.913C5.98678 13.3419 7.81534 15.6456 9.09118 17.5776C11.0165 12.9816 15.1646 4.84563 19.8062 2.75403C22.1337 1.94811 22.8151 3.19347 21.6249 5.04483Z'
      fill='#0FAE62'
    />
  </svg>
);
export default IconTick;
