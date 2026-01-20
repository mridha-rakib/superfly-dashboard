
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import tick from "../../assets/Vector.svg";

function Successful() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <img src="logo.png" alt="Superfly Logo" className="w-24 h-24" />
            </div>
            <div className="flex justify-center">
              <img src={tick} alt="Tick" className="w-16 h-16" />
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xl sm:text-2xl font-semibold text-gray-800">Success!</p>
            <p className="text-gray-600 mt-2">Your password has been set successfully.</p>
          </div>

          <button
            onClick={handleBackToLogin}
            className="w-full h-12 flex justify-center items-center gap-2 text-white mt-8 px-4 rounded-lg bg-[#C85344] hover:bg-[#C85344] cursor-pointer font-medium transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Successful;
