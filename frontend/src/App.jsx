import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './page/Login';
import Tasks from './page/Tasks';
import Planned from './page/Planned';
import Important from './page/Important';
import Space from './page/Space';
import AddNewTask from './page/AddNewTask';
import AddNewSpace from './page/AddNewSpace';
import SpaceView from './page/SpaceView';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/planned" element={<Planned />} />
        <Route path="/important" element={<Important />} />
        <Route path="/spaces" element={<Space />} />
        <Route path="/space" element={<SpaceView />} />
        <Route path="/add-task" element={<AddNewTask />} />
        <Route path="/add-space" element={<AddNewSpace />} />

      </Routes>
    </>
  )
}

export default App
