import React, { useState, useEffect } from 'react';
import { Video } from '../../../types/video';
import { classService } from '../../../services/classService';
import { Class } from '../../../types';
import { videoService } from '../../../services/videoService';

interface AssignVideoDialogProps {
  video: Video;
  onClose: () => void;
  onSave: () => void;
}

const AssignVideoDialog: React.FC<AssignVideoDialogProps> = ({
  video,
  onClose,
  onSave,
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const teacherClasses = await classService.getClassesForTeacher();
        setClasses(teacherClasses);
        setSelectedClassIds(new Set(video.assignedClassIds || []));
      } catch (err: any) {
        setError(err.message || 'Failed to load classes.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [video]);

  const handleCheckboxChange = (classId: string) => {
    setSelectedClassIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await videoService.assignVideoToClasses(
        video.id,
        Array.from(selectedClassIds)
      );
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save assignments.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Assign Video: {video.title}</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Classes
          </h3>
          {loading ? (
            <div className="text-center">Loading classes...</div>
          ) : classes.length === 0 ? (
            <p className="text-gray-600">No classes available to assign.</p>
          ) : (
            <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
              {classes.map((cls) => (
                <label
                  key={cls.id}
                  className="flex items-center space-x-3 mb-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedClassIds.has(cls.id)}
                    onChange={() => handleCheckboxChange(cls.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                    disabled={saving}
                  />
                  <span className="text-gray-700">
                    {cls.name} - {cls.description}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignVideoDialog;
