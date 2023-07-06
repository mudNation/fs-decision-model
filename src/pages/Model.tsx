import "../styles/model.scss";
import Select from 'react-select'
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ModelType, DEFAULT_MODEL, ModelList } from "../types";
import { firestore } from "../firebase";
import { doc, setDoc, collection, addDoc, deleteDoc } from "firebase/firestore"; 

// import SingleValue from "react-select/dist/declarations/src/components/SingleValue";

export type FormData = {
    [key: string]: any; 
}

interface OptionValue{
    value: string,
    label: string,
}

const Model = () => {
    const navigate = useNavigate(); 
    const { id } = useParams();  
    const [buttonText, setButtonText] = useState('CREATE'); 
    const [model, setModel] = useState<ModelType>(); 
    const [deleteLoading, setDeleteLoading] = useState(false); 
    const [createLoading, setCreateLoading] = useState(false); 
    

    useEffect(() => {
        if(id !== undefined){
            setButtonText("UPDATE");
            const parsedModel = JSON.parse(id); 
            addUndefinedModels(parsedModel.model_list); 

            setModel(JSON.parse(id || "{}")); 
        }else{

            const modelList = structuredClone(DEFAULT_MODEL); 
            console.log(modelList); 
            const tempModel: ModelType = {
                name: '', 
                description: '', 
                version: 1,
                modules: 8,
                model_list: modelList,
            }

            setModel({...tempModel}); 
        }
    }, [id]); 

    const addUndefinedModels = (modelList: ModelList) => {
        const newList = {...modelList}; 

        Object.keys(DEFAULT_MODEL).forEach((key) => {
            if(newList[key] === undefined){
                newList[key] = undefined; 
            }
        })
    }

    const getSortedModel = () => {
        if(model!==undefined){
            const newObj:ModelList = {}; 

            for(let i = 1; i<= 8; i++){
                const mod = Object.keys(model.model_list).find((key) => 
                    model?.model_list[key] && model?.model_list[key].sequence === i); 
                
                if(mod === undefined){
                    continue; 
                }

                newObj[mod] = model.model_list[mod]; 
            }

            return newObj; 
        }
    }

    const getAddOptions = () => {
        if(model !== undefined){
            const addArray: OptionValue[] = []; 
            Object.keys(DEFAULT_MODEL).forEach((key) => {
                if(model.model_list[key] === undefined){
                    addArray.push({
                        label: key, value: key
                    })
                }
            })

            return addArray; 
        }
    }

    const getModuleLengthOptions = () => {
        const lengthOptions: OptionValue[] = []; 
        if(model !== undefined){
            let count = 1; 
            lengthOptions.push({
                label: count.toString(), value: count.toString(),
            });
            count++; 

            Object.keys(DEFAULT_MODEL).forEach((key) => {
                if(model.model_list[key] !== undefined){
                    lengthOptions.push({
                        label: count.toString(), value: count.toString(),
                    });
                    count++; 
                }
            })
        }

        return lengthOptions; 
    }

    const addOptions = getAddOptions(); 
    const lengthOptions = getModuleLengthOptions(); 
    const moduleLengthOption = lengthOptions.filter((length) => length.value !== lengthOptions.length.toString())

    const sortedModel:ModelList | undefined = getSortedModel(); 

    const options = [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
    ]

    const [addModuleOption, setAddModuleOption] = useState<OptionValue>(); 
    const [addModulePosition, setAddModulePosition] = useState<OptionValue>(); 


    const handleBackClick = () => {
        navigate("/");
    }

    const handleCreateModel = () => {
        if(model?.name.length === 0 || model?.description.length===0){
            toast("Please enter a name or description"); 
            return; 
        }

        setCreateLoading(true); 

        
        if(buttonText === "CREATE"){
            const updateRef = collection(firestore, "models"); 
            addDoc(updateRef, {...model, model_list: getSortedModel()}).then((response) => {
                toast("Model has been created successfully"); 
                navigate("/");
                setCreateLoading(false); 
            })
        }else{
            const updateRef = doc(firestore, "models", model?.id || ""); 
            setDoc(updateRef, {...model, model_list: getSortedModel(), 
                    version: model?.version !== undefined ? model?.version+1 : 1}).then((response) => {
                toast("Model has been created successfully"); 
                navigate("/");
                setCreateLoading(false); 
            })
        }
    }

    const handleTitleChange = (index: string, value: string,) => {
        const tempModel = model;
        if(tempModel !== undefined){
            tempModel[index] = value; 
            setModel({...tempModel})
        }
    }

    const handleExtraChange = (module: string, index: string, value: string) =>{
        if(model !== undefined){
            const tempModel = model; 
            tempModel.model_list[module][index] = value; 
            setModel({...tempModel})
        }
    }

    const handleSelectChange = (selectOptions: OptionValue | null, module: string, variable: string) =>{
        if(model !== undefined){
            const tempModel = model; 
            tempModel.model_list[module][variable] = selectOptions?.value; 
            setModel({...tempModel})
        }
    }

    const handleDeleteModule = (module: string) => {
        if(model !== undefined){
            
            let tempModel = structuredClone(model); 
            const sequence = tempModel.model_list[module].sequence; 

            tempModel.model_list[module] = undefined;
            const modelList = tempModel.model_list; 

            for(let i = parseInt(sequence)+1;  i <= 8; i++){

                const module = Object.keys(modelList).find((m) => 
                modelList[m] !== undefined && parseInt(modelList[m].sequence) === i); 

                if(module === undefined){
                    continue; 
                }

                modelList[module].sequence = parseInt(modelList[module].sequence) - 1; 
            }

            tempModel = {...tempModel, model_list: modelList, modules: tempModel.modules-1}
            setModel(structuredClone(tempModel))
        }
    }

    const handleAddModuleClick = () => {
        if(addModuleOption !== undefined && addModulePosition !== undefined 
            && addModuleOption.value !== "" && addModulePosition.value!==""){
            if(model === undefined){
                return; 
            }

            const position = parseInt(addModulePosition.value); 
            const defaultModels = DEFAULT_MODEL as ModelList; 
            const newModule = structuredClone(defaultModels[addModuleOption.value || '']);
            let tempModel = structuredClone(model); 
            let modelList = tempModel.model_list; 

            for(let i = Object.keys(modelList || '').length;  i >= position; i--){
                if(modelList !== undefined){

                    const module = Object.keys(modelList).find((m) => modelList !== undefined &&
                        modelList[m] !== undefined && parseInt(modelList[m].sequence) === i); 
                    
                    if(module === undefined){
                        continue; 
                    }

                    modelList[module].sequence = parseInt(modelList[module].sequence) + 1;  
                }
            }

            modelList[addModuleOption.value] = newModule; 
            modelList[addModuleOption.value].sequence = position;

            tempModel = {...tempModel, model_list: modelList, modules: tempModel.modules+1}

            setAddModuleOption({value: '', label:'Select...'}); 
            setAddModulePosition({value: '', label:'Select...'}); 
            setModel(structuredClone(tempModel))
        }
    }

    const handlePositionChange = (value: OptionValue, module: string, current: number) => {
        if(model === undefined){
            return; 
        }

        const newPosition = parseInt(value.label); 
        const currentPosition = current + 1; 
        if(newPosition > currentPosition){
            let tempModel = model; 
            let modelList = tempModel.model_list; 

            for(let i = currentPosition+1;  i <= newPosition; i++){
                if(modelList !== undefined){
                    const module = Object.keys(modelList).find((m) => modelList !== undefined &&
                        modelList[m] !== undefined && parseInt(modelList[m].sequence) === i); 

                    
                    if(module === undefined){
                        continue; 
                    }

                    modelList[module].sequence = parseInt(modelList[module].sequence) - 1;  
                }
            }
            modelList[module].sequence = newPosition; 
            tempModel = {...tempModel, model_list: modelList}
            setModel({...tempModel})
        }else if(newPosition < currentPosition){
            let tempModel = model; 
            let modelList = tempModel.model_list; 

            for(let i = currentPosition-1;  i >= newPosition; i--){
                if(modelList !== undefined){
                    const module = Object.keys(modelList).find((m) => modelList !== undefined &&
                        modelList[m] !== undefined && parseInt(modelList[m].sequence) === i); 

                    
                    if(module === undefined){
                        continue; 
                    }

                    modelList[module].sequence = parseInt(modelList[module].sequence) + 1;  
                }
            }

            modelList[module].sequence = newPosition; 
            tempModel = {...tempModel, model_list: modelList}
            setModel({...tempModel})
        }
    }
    

    const getModelName =(name: string):string => {
        let nameArray = name.split("_"); 
        for(let i = 0; i < nameArray.length; i++){
            nameArray[i] = nameArray[i][0].toUpperCase() + nameArray[i].slice(1); 
        }
        
        return nameArray.join(" "); 
    }

    const handleDeleteClick = () => {
        setDeleteLoading(true)
        const ref = doc(firestore, "models", model?.id || ""); 
        deleteDoc(ref).then(() => {
            setDeleteLoading(false); 
            toast("Model has been deleted"); 
            navigate("/"); 
        })
    }

    return(
        <div className="modelContent">
            <div className="buttonContainer">
                
                <i className="fa-solid fa-arrow-left-long" onClick={handleBackClick}></i>
                <div className="buttonHolder">
                    {
                        buttonText === "UPDATE" ? <button onClick={handleDeleteClick}>
                            {!deleteLoading ? "DELETE MODEL" : '...'}
                        </button> : ''
                    }
                    
                    <button onClick={handleCreateModel}>{!createLoading ? buttonText + " MODEL" : "..."}</button>
                </div>
                
            </div>


            <div className="container">
                <h4 className="title">Decision Model Details</h4>
                <p className="subText">Edit your decision model name and description</p>

                <div className="settingsRow">
                    <div className="fieldHolder">
                        <label>Model Name<span>*</span></label>
                        <input type='text' placeholder="Name of model" value={model?.name} 
                            onChange={(e) => handleTitleChange("name", e.target.value)}/>
                    </div>

                    <div className="fieldHolder">
                        <label>Model Description<span>*</span></label>
                        <input type='text' placeholder="Name of model" value={model?.description} 
                            onChange={(e) => handleTitleChange("description", e.target.value)}/>
                    </div>
                </div>
            </div>

            <div className="secondContainer">
                <div className="addSection">
                    <div className="addFirstDiv">
                        <h4 className="title">Decision Model Settings</h4>
                        <p className="subText">The setting to specify the decision modules you require</p>
                    </div>
                    
                    {
                        addOptions?.length !== 0 ? 
                        <div className="addContainer">
                            <button onClick={handleAddModuleClick}>Add Module</button>
                            <div className="addSelectHolder firstHolder right">
                                <label>Select Module</label>
                                <Select options={addOptions} className="selectClass" 
                                    value={addModuleOption}
                                    onChange={(value) => setAddModuleOption(value || undefined)} />
                            </div>

                            <div className="addSelectHolder secondHolder">
                                <label>Select Position</label>
                                <Select options={lengthOptions} className="selectClass" 
                                    value={addModulePosition}
                                    onChange={(value) => setAddModulePosition(value || undefined)}/>
                            </div>
                        </div> : null
                    }
                    
                </div>
                

                {
                    sortedModel !== undefined ? 
                    Object.keys(sortedModel).map((m, index) => {
                        if(model?.model_list[m] === undefined){
                            return ''; 
                        }
                        return (
                        <div className="modelContainer" >
                            <div className="controls">
                                <p className="index">#{index+1}</p>

                                <div className="controlsSelect">
                                    <p>Move To Position</p>
                                    <Select options={moduleLengthOption} value ={{label: "Select...", value: ""}}
                                        onChange={(value) => handlePositionChange(value as OptionValue, m, index)}/>
                                </div>

                                <button onClick={() => handleDeleteModule(m)}>DELETE MODULE</button>
                            </div>

                            <h5 className="modelTitle">{getModelName(m)}</h5>

                            {
                                model?.model_list[m].provider!==undefined &&
                                <div className="modelFieldHolder">
                                    <label>Provider</label>
                                    <input type='text' value={model?.model_list[m].provider} 
                                        onChange={(e) => handleExtraChange(m, "provider", e.target.value)}/>
                                </div>
                            }
                            
                            {
                                model?.model_list[m].minimum!==undefined &&
                                <div className="modelFieldHolder">
                                    <label>Minimum</label>
                                    <input type='number' value={model?.model_list[m].minimum}
                                        onChange={(e) => handleExtraChange(m, "minimum", e.target.value)}/>
                                </div>
                            }
                            

                            <div className="modelFieldHolder">
                                <label>Required?</label>
                                <Select options={options} 
                                    value={options[0].value === model?.model_list[m].required.toString() ? options[0] : options[1]}
                                    onChange={(value) => handleSelectChange(value, m, "required")}/>
                            </div>

                        
                            <div className="modelFieldHolder">
                                <label>Continue on failure</label>
                                <Select options={options} value={options[0].value === model?.model_list[m].continue_on_failure.toString() ? options[0] : options[1]}
                                    onChange={(value) => handleSelectChange(value, m, "continue_on_failure")}/>
                            </div>

                        </div>
                    )}) : ''
                }
                
            </div>

            <ToastContainer />
        </div>
    )
}


export default Model; 