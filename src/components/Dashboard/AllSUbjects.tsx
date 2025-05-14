import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Book, 
  RefreshCw, 
  BookOpen, 
  Code, 
  AlertCircle, 
  PlusCircle,
  Loader2
} from 'lucide-react';

interface Subject {
  subjectCode: string;
  subjectName: string;
  _id: string;
}

interface APIResponse {
  subjects: Subject[];
}

const SUBJECT_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-yellow-500 to-orange-600',
  'from-red-500 to-pink-600',
  'from-indigo-500 to-purple-600'
];

export const AllSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const getSubjectColor = (id: string) => {
    const index = id.charCodeAt(0) % SUBJECT_COLORS.length;
    return SUBJECT_COLORS[index];
  };

  async function fetchSubjects() {
    try {
      setIsLoading(true);
      setError(null);
      
      const userEmail = localStorage.getItem("email");
      const response = await axios.get<APIResponse>(`https://trakly.onrender.com/api/get/subjects?email=${userEmail}`);
      
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to load subjects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
    setTimeout(() => setMounted(true), 100);
  }, []);

  const LoadingState = () => (
    <div className={`bg-slate-800 rounded-xl shadow-md p-8 flex flex-col items-center justify-center space-y-4 transition-all duration-500 ${mounted ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
      <div className="animate-pulse flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">Loading your subjects...</h3>
        <p className="text-slate-400 text-center max-w-md">
          We're retrieving your academic information. This should only take a moment.
        </p>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className={`bg-slate-800 rounded-xl shadow-md p-8 flex flex-col items-center justify-center space-y-4 text-center transition-all duration-500 ${mounted ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-indigo-900/30 rounded-full p-4 mb-2">
        <Book className="h-10 w-10 text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold text-white">No subjects found</h3>
      <p className="text-slate-400 max-w-md mb-2">
        You don't have any subjects yet. Once you add subjects, they will appear here.
      </p>
      <button
        onClick={fetchSubjects}
        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        <span>Refresh</span>
      </button>
    </div>
  );
  
  const SubjectCard = ({ subject }: { subject: Subject }) => {
    return (
      <div 
        className={`bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fadeIn ${mounted ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`} 
        style={{ animationDelay: `${subjects.findIndex(s => s._id === subject._id) * 75}ms` }}
      >
        <div className={`h-2 bg-gradient-to-r ${getSubjectColor(subject._id)}`} />
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="bg-indigo-900/30 rounded-full p-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex items-center px-2 py-1 bg-slate-700 rounded-md">
              <Code className="h-3 w-3 mr-1 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">{subject.subjectCode}</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-1 text-white group-hover:text-indigo-400 transition-colors duration-200">
            {subject.subjectName}
          </h3>
          
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
            <span className="text-xs text-slate-400">Subject ID: {subject._id.substring(0, 8)}...</span>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const SubjectList = ({ subjects }: { subjects: Subject[] }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject._id} subject={subject} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <div className="bg-indigo-900/50 p-3 rounded-lg mr-4">
            <Book className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Your Subjects</h1>
            <p className="text-slate-400 mt-1">Manage your academic courses</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubjects}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700/70 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md">
            <PlusCircle className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-300 px-6 py-5 rounded-xl mb-6 flex items-start animate-fadeIn">
          <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium mb-1">Error loading subjects</h3>
            <p className="text-red-300/90 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <LoadingState />
      ) : subjects.length > 0 ? (
        <SubjectList subjects={subjects} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
};