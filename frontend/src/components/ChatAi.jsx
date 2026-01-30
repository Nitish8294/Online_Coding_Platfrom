import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { role: 'model', parts:[{text: "Hi! I'm your AI assistant. How can I help you with this problem?"}]}
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset,formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        
        const newMessage = { role: 'user', parts: [{ text: data.message }] };
        const newMessages = [...messages, newMessage];
        
        setMessages(newMessages);
        reset();
        setIsLoading(true);

        try {
            
            const response = await axiosClient.post("/ai/chat", {
                messages: newMessages,
                title: problem?.title,
                description: problem?.description,
                testCases: problem?.visibleTestCases,
                startCode: problem?.startCode
            });

           
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: response.data.message}] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts:[{text: "Error from AI Chatbot"}]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-200">AI Assistant</h3>
                    <p className="text-xs text-slate-500">Powered by Gemini</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-950 scroll-smooth">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-indigo-600" : "bg-slate-800"}`}>
                            {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-emerald-400" />}
                        </div>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                            msg.role === "user" 
                                ? "bg-indigo-600 text-white rounded-tr-none" 
                                : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
                        }`}>
                            {msg.parts?.[0]?.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                            <Bot size={14} className="text-emerald-400" />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="p-4 bg-slate-900 border-t border-slate-800"
            >
                <div className="relative flex items-center">
                    <input 
                        placeholder="Ask a question about this problem..." 
                        className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 border border-slate-700 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" 
                        autoComplete="off"
                        {...register("message", { required: true })}
                    />
                    <button 
                        type="submit" 
                        className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        disabled={isLoading || errors.message}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;