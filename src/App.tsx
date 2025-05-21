import './App.css'
import { GlobeCitys } from './globe_citys'
import { WebGLEarth } from './webgl_earth'
import { WebGPUEarth } from './webgpu_tsl_earth'

function App() {

  return (
    <>
      {/* <GlobeCitys /> */}
      {/* <WebGPUEarth /> */}
      <WebGLEarth />
    </>
  )
}

export default App
