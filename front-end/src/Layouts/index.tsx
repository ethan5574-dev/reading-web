'use client';

import React, { ReactNode, useEffect } from 'react';
import Header from './Header';
import useMounted from '@/hook/useMounted';
import Loading from '@/app/loading';


const Layout = ({ children }: { children: ReactNode }) => {
    const { isMounted } = useMounted();
    const turnOffConsole = false;

    //useScaleLayout();

    useEffect(() => {
        if (turnOffConsole) {
            console.log = () => { };
            console.warn = () => { };
            console.error = () => { };
        }
    }, []);

    return (
        <div className='overflow-hidden'>
            {!isMounted ? (
                <Loading />
            ) : (
                <>
                    {<Header />}
                    {children}

                </>
            )}


        </div>
    );
};

export default Layout;
