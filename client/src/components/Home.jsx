// import React from 'react';

// const Home = () => {
//   return (
//     <div className="text-center">
//       <h1 className="text-4xl font-bold text-blue-700">Welcome to FindMyMentor 🏡</h1>
//       <p className="mt-4 text-gray-600 text-lg">Find the mentor, hassle-free.</p>
//     </div>
//   );
// };

// export default Home;
import React from 'react';

const Home = () => {
    const role = localStorage.getItem('role');
 

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-blue-700">
        Welcome to FindMyMentor 🏡
      </h1>

      {role === "mentor" && (
        <p className="mt-4 text-gray-600 text-lg">
          Hello Mentor 👨‍🏫 — Manage your learners and help them grow!
        </p>
      )}

      {role === "learner" && (
        <p className="mt-4 text-gray-600 text-lg">
          Hello Learner 👩‍🎓 — Find the best mentors to guide your journey!
        </p>
      )}

      {!role && (
        <p className="mt-4 text-gray-600 text-lg">
          Find the mentor, hassle-free.
        </p>
      )}
    </div>
  );
};

export default Home;
