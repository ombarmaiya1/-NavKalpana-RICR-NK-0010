import { createContext, useContext, useState } from 'react';

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
    const [sessionId, setSessionId] = useState(null);
    const [totalQuestions, setTotalQuestions] = useState(0);

    const value = {
        sessionId,
        setSessionId,
        totalQuestions,
        setTotalQuestions,
    };

    return (
        <InterviewContext.Provider value={value}>
            {children}
        </InterviewContext.Provider>
    );
}

export function useInterview() {
    const ctx = useContext(InterviewContext);
    if (!ctx) {
        throw new Error('useInterview must be used within <InterviewProvider>');
    }
    return ctx;
}

