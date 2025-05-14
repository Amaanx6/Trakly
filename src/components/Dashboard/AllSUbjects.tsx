import axios from 'axios';
import { useState } from 'react';

// Define interfaces for the API response structure
interface Subject {
  subjectCode: string;
  subjectName: string;
  _id: string;
}

interface APIResponse {
  subjects: Subject[];
}

export const AllSubjects = () => {
    // Store the subjects array
    const [subjects, setSubjects] = useState<Subject[]>([]);

    async function FetchSubjects() {
        try {
            const userEmail = localStorage.getItem("email");
            const response = await axios.get<APIResponse>(`https://trakly.onrender.com/api/get/subjects?email=${userEmail}`);
            
            // Access the subjects array from the response
            setSubjects(response.data.subjects);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    }

    return (
        <div>
            <p>All Subjects are listed here:</p>
            
            {/* Render the subjects with proper mapping */}
            {subjects.length > 0 ? (
                <ul>
                    {subjects.map((subject) => (
                        <li key={subject._id}>
                            {subject.subjectName} ({subject.subjectCode})
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