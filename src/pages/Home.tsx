import { useEffect, useState } from "react";
import "../styles/home.scss"; 
import { useNavigate } from "react-router-dom";
import { firestore } from "../firebase";
import { doc, collection, getDocs, deleteDoc } from "firebase/firestore"; 
import { ModelType } from "../types";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
    const navigate = useNavigate(); 
    const [modelList, setModelList] = useState<ModelType[]>(); 
    const [downloading, setDownloading] = useState(true); 

    const handleDeleteClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string) => {
        const ref = doc(firestore, "models", id); 
        deleteDoc(ref).then(() => {
            toast("Model has been deleted"); 
            let tempModel = modelList; 
            tempModel = tempModel?.filter((model) => model.id !== id);
            setModelList([...tempModel || []])
        })

        event.stopPropagation(); 
    }

    const handleModelClick = (model: string) => {
        navigate(`/model/${model}`) 
    }

    const handleAddClick = () => {
        navigate("/model"); 
    }

    useEffect(() => {
        const ref = collection(firestore, 'models'); 
        getDocs(ref).then((response) => {
            const tempArray:ModelType[] = []; 
            for(let i = 0; i < response.docs.length; i++){
                const data = response.docs[i].data(); 
                tempArray.push({
                    name:  data.name,
                    description: data.description,
                    version: data.version,
                    modules: data.modules,
                    model_list: data.model_list,
                    id: response.docs[i].id || undefined}); 
            }

            setModelList([...tempArray])
            setDownloading(false); 
        })
    }, [])

    return(
        <div className="homeContainer">
            <button onClick={handleAddClick}>ADD MODEL</button>
            <div className="homeTable">
                <div className="row">
                    <p>MODEL</p>
                    <p>DESCRIPTION</p>
                    <p>VERSION NUMBER</p>
                    <p>MODULES</p>

                    <div></div>
                </div>

                {
                    downloading ? <p className="loading">Loading....</p> : 

                    modelList?.length === 0 ? <p className="loading">No Models Created</p> : 
                    modelList?.map((model) => (
                        <div className="row" onClick={() => handleModelClick(JSON.stringify(model))} key={model.id}>
                            <p>{model.name}</p>
                            <p>{model.description}</p>
                            <p>{model.version}</p>
                            <p>{model.modules}</p>

                            <div onClick={(e) => handleDeleteClick(e, model.id || "")}><i className="fa-solid fa-trash bin"></i></div>
                        </div>
                    ))
                }
            </div>

            <ToastContainer />
        </div>
    )
}


export default Home; 