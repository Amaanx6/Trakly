import React from 'react';
import { Search } from 'lucide-react';
import GlassContainer from '../Common/GlassContainer';

interface TaskFilterProps {
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
  onPriorityChange: (priority: string) => void;
  searchValue: string;
  filter: string;
  priority: string;
}

const TaskFilter: React.FC<TaskFilterProps> = ({
  onFilterChange,
  onSearchChange,
  onPriorityChange,
  searchValue,
  filter,
  priority,
}) => {
  return (
    <GlassContainer className="p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-dark-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="glass pl-10 pr-4 py-2 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1 md:w-40">
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="glass px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="flex-1 md:w-40">
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="glass px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </GlassContainer>
  );
};

export default TaskFilter;