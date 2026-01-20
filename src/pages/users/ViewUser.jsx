import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { usersDummyData } from "../../constants/usersDummyData";

const roleColors = {
  Cleaner: "bg-blue-100 text-blue-800",
  Admin: "bg-green-100 text-green-800",
  Staff: "bg-yellow-100 text-yellow-800",
};

function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = usersDummyData.find((u) => u.id === id);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-semibold text-red-600 mb-6">
          User Not Found
        </h2>
        <Button onClick={() => navigate("/users")}>Back to Users</Button>
      </div>
    );
  }

  const { name, contact, role, jobCompleted, rating } = user;

  return (
    <div className="space-y-10  min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        User Details
      </h1>

      {/* Basic Info */}
      <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2 border-gray-200">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
          <p className="text-lg">
            <span className="font-medium text-gray-900">Full Name:</span> {name}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-900">Contact:</span> {contact}
          </p>
          <p className="text-lg">
            <span className="font-medium text-gray-900">Role:</span>{" "}
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${roleColors[role]}`}
            >
              {role}
            </span>
          </p>
          {role === "Cleaner" && (
            <>
              <p className="text-lg">
                <span className="font-medium text-gray-900">Jobs Completed:</span> {jobCompleted}
              </p>
              <p className="text-lg">
                <span className="font-medium text-gray-900">Rating:</span> {rating} / 5
              </p>
            </>
          )}
        </div>
      </section>

    
    </div>
  );
}

export default ViewUser;
