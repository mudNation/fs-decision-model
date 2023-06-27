import {BrowserRouter, Route, Routes} from 'react-router-dom'; 
import Home from './pages/Home';
import Model from './pages/Model';
 
const Application = () => {
    return (  
        <BrowserRouter> 
            <Routes>
                <Route path = "/" element={<Home/>} />
                <Route path = "/model">
                    <Route index element = {<Model/>}/>
                    <Route path=":id" element = {<Model/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
 
export default Application;