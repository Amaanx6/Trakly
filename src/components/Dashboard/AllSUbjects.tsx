import axios from 'axios';
import { useState } from 'react';

// Define an interface for the Subject type
interface Subject {
  id?: string;
  name?: string;
  title?: string;
  [key: string]: any; // Allow for any additional properties
}

export const AllSubjects = () => {
    // Properly type the state
    const [Subjects, setSubjects] = useState<Subject[]>([]);

    async function FetchSubjects() {
        const userEmail = localStorage.getItem("email");
        const response = await axios.get<Subject[]>(`https://trakly.onrender.com/api/get/subjects?email=${userEmail}`);
        
        // Explicitly cast the response data to Subject[]
        setSubjects(response.data as Subject[]);
    }

    return (
        <div>
            <p>All Subjects are listed here:</p>
            
            {/* Render the subjects with proper mapping */}
            {Array.isArray(Subjects) && Subjects.length > 0 ? (
                <ul>
                    {Subjects.map((subject, index) => (
                        <li key={index}>
                            {/* Adjust this based on your actual data structure */}
                            {subject.name || subject.title || JSON.stringify(subject)}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No subjects loaded yet</p>
            )}
            
            <button onClick={FetchSubjects}>OOh YEAh</button>
        </div>
    )
}