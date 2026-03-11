import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const DashboardRedirect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        } else if (user?.role === 'producer') {
            navigate('/producer/dashboard', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Synchronizing Session...</p>
            </div>
        </div>
    );
};

export default DashboardRedirect;
