import React, { useState, useEffect, useContext } from 'react'; 
import axios from 'axios';
import { URL } from '../config';
import UserContext from '../UserContext';


axios.defaults.baseURL = URL;


const UserInput = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [identifiedType, setIdentifiedType] = useState('');
    const [types, setTypes] = useState([]); // State for categories
    const [extractedData, setExtractedData] = useState({});

    const { userID } = useContext(UserContext);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await axios.get(`${URL}/api/types`);
                setTypes(response.data);
            } catch (error) {
                console.error("API error:", error.response);
            }
        };

        fetchTypes();
    }, []); // Run this effect once when component mounts

    
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${URL}/api/identify`, { content });
            setIdentifiedType(response.data.type);
            
            // Ensure type is identified before extraction
            if (response.data.type) {
                handleExtraction(response.data.type); // pass the type here
            }
                
        } catch (error) {
            console.error("API error:", error.response);
        }
        setLoading(false);
    }
    
    const handleExtraction = async (type) => {
        try {
            const response = await axios.post(`${URL}/api/extract`, { content, type });
            setExtractedData(response.data.data);
    
            // Use the userID directly from the UserContext
            const data = {
                userId: userID,  // using userID from UserContext
                ...response.data.data
            };
            if(!userID) {
                console.error("User ID is null or undefined");
                return;
            }
            saveDataToDatabase(data, type.toLowerCase());  // Convert 'Travel' to 'travel'
        } catch (error) {
            console.error("API error during extraction:", error.response);
        }
    }
    
    const saveDataToDatabase = async (data, type) => {
        try {
            const response = await axios.post(`${URL}/api/${type}/add`, data);
            console.log("Data saved:", response.data);
        } catch (error) {
            console.error(`API error during data save for type ${type}:`, error.response);
        }
    }

    return (
        <div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here..."
                rows={10}
                cols={50}
            />
            <button onClick={handleSubmit} disabled={loading}>
                Submit
            </button>

            {/* Display type after identification */}
            {identifiedType && (
                <div>
                    <label htmlFor="type">Identified Type: </label>
                    <select
                        id="type"
                        value={identifiedType}
                        onChange={(e) => setIdentifiedType(e.target.value)}
                    >
                        {types.map(ele => (
                            <option key={ele} value={ele}>
                                {ele}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Display extracted data */}
            {Object.keys(extractedData).length > 0 && (
                <div>
                    <h3>Extracted Data:</h3>
                    <ul>
                        {Object.entries(extractedData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default UserInput;
