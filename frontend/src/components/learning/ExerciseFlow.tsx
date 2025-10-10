import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ExerciseList from '../exercise/ExerciseList';
import ExerciseScreen from '../exercise/ExerciseScreen';

const ExerciseFlow: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ExerciseList />} />
      <Route path="/:exerciseId" element={<ExerciseScreen />} />
    </Routes>
  );
};

export default ExerciseFlow;
