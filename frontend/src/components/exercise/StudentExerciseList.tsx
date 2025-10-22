import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, Course } from '../../types';
import { exerciseService } from '../../services/exerciseService';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Target,
  Edit3,
  CheckSquare,
  BookOpen,
  HelpCircle,
  Clock,
  Rocket,
  FileText,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

const StudentExerciseList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    'all' | 'multiple_choice' | 'fill_blank'
  >('all');

  useEffect(() => {
    loadStudentExercises();
  }, []);

  const loadStudentExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all exercises and courses
      const [exercisesData, coursesData] = await Promise.all([
        exerciseService.getAllExercises(),
        courseService.getAllCourses(),
      ]);

      setExercises(exercisesData);
      setCourses(coursesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || 'Unknown Course';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <CheckSquare size={16} />;
      case 'fill_blank':
        return <Edit3 size={16} />;
      default:
        return <HelpCircle size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'fill_blank':
        return 'Fill in the Blanks';
      default:
        return type;
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    if (selectedType === 'all') return true;
    return exercise.type === selectedType;
  });

  const handleStartExercise = (exercise: Exercise) => {
    navigate(`/student/exercises/${exercise.id}`);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Loader2
              size={40}
              color="white"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Loading Exercises
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.6',
            }}
          >
            Please wait while we load your exercises...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={40} color="white" />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Error Loading Exercises
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            {error}
          </p>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <button
              onClick={loadStudentExercises}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Practice with Baby!
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.6',
            }}
          >
            Choose your favorite exercise to start learning!
          </p>
        </div>

        {/* Type Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setSelectedType('all')}
            style={{
              background:
                selectedType === 'all'
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                  : 'rgba(255, 255, 255, 0.9)',
              color: selectedType === 'all' ? 'white' : '#374151',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow:
                selectedType === 'all'
                  ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (selectedType !== 'all') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== 'all') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <Target size={20} />
            All
          </button>
          <button
            onClick={() => setSelectedType('fill_blank')}
            style={{
              background:
                selectedType === 'fill_blank'
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                  : 'rgba(255, 255, 255, 0.9)',
              color: selectedType === 'fill_blank' ? 'white' : '#374151',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow:
                selectedType === 'fill_blank'
                  ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (selectedType !== 'fill_blank') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== 'fill_blank') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <Edit3 size={20} />
            Fill in the Blanks
          </button>
          <button
            onClick={() => setSelectedType('multiple_choice')}
            style={{
              background:
                selectedType === 'multiple_choice'
                  ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                  : 'rgba(255, 255, 255, 0.9)',
              color: selectedType === 'multiple_choice' ? 'white' : '#374151',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow:
                selectedType === 'multiple_choice'
                  ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (selectedType !== 'multiple_choice') {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType !== 'multiple_choice') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <CheckSquare size={20} />
            Multiple Choice
          </button>
        </div>

        {/* Content */}
        {filteredExercises.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
              }}
            >
              <FileText size={40} color="white" />
            </div>
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              No Exercises Available
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.6',
              }}
            >
              No exercises found in this category
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow =
                    '0 25px 50px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 20px 40px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Exercise Type Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {getTypeIcon(exercise.type)}
                  {getTypeLabel(exercise.type)}
                </div>

                {/* Exercise Title */}
                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 20px 0',
                    paddingRight: '120px',
                  }}
                >
                  {exercise.title}
                </h3>

                {/* Exercise Details */}
                <div
                  style={{
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <BookOpen size={16} color="#10b981" />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                      }}
                    >
                      Course:
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: '600',
                      }}
                    >
                      {getCourseName(exercise.course_id)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <HelpCircle size={16} color="#ef4444" />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                      }}
                    >
                      Questions:
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: '600',
                      }}
                    >
                      {exercise.questions.length}
                    </span>
                  </div>

                  {exercise.time_limit && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Clock size={16} color="#f59e0b" />
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: '500',
                        }}
                      >
                        Time Limit:
                      </span>
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#1f2937',
                          fontWeight: '600',
                        }}
                      >
                        {exercise.time_limit} minutes
                      </span>
                    </div>
                  )}
                </div>

                {/* Sample Question */}
                {exercise.questions.length > 0 && (
                  <div
                    style={{
                      marginBottom: '24px',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Sample Question:
                    </h4>
                    <div
                      style={{
                        background: 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                      }}
                    >
                      {exercise.questions[0].content.length > 100
                        ? `${exercise.questions[0].content.substring(0, 100)}...`
                        : exercise.questions[0].content}
                    </div>
                  </div>
                )}

                {/* Start Button */}
                <button
                  onClick={() => handleStartExercise(exercise)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <Rocket size={20} />
                  Start Practicing!
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExerciseList;
