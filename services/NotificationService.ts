export const NotificationService = {
    resolveNotification: async (id: string, action: 'resolved' | 'delegated', activeUserId: string, delegatedToUserId?: string) => {
        // Mock async delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { 
            data: { 
                resolvedAt: new Date().toISOString(), 
                resolvedBy: activeUserId, 
                action, 
                delegatedToUserId 
            } 
        };
    }
};
