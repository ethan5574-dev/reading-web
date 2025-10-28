import { customUnitFn } from '@/utils';
import * as React from 'react';
import { SVGProps } from 'react';
const IconX = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={customUnitFn(20)}
    height={customUnitFn(21)}
    viewBox='0 0 20 21'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M15.7508 1.14368H18.8175L12.1175 8.80201L20 19.2212H13.8283L8.995 12.9012L3.46333 19.2212H0.395L7.56167 11.0295L0 1.14451H6.32833L10.6975 6.92118L15.7508 1.14368ZM14.675 17.3862H16.3742L5.405 2.88284H3.58167L14.675 17.3862Z'
      fill='#600F0F'
    />
  </svg>
);
export default IconX;
