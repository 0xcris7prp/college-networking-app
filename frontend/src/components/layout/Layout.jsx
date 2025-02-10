import Navbar from "./Navbar"

import React from 'react'

const Layout = ({ children }) => {
    return (
        <div className='min-h-screen bg-base-100'>
            <Navbar />
            <main className='mx-w-7xl max-auto px-4 py-4'>
                {children}
            </main>
        </div> 
    )
}

export default Layout;

