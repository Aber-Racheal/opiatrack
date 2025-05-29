import React from "react";

interface AuthFormProps {
  title: string;
  children: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthForm;
