import "./App.css";
import SpcPlayer from "./SpcPlayer";
import x3Boss from "./assets/songs/X3 Boss.spc";

function App() {  
  return (
    <>
      <div>
          Helllooo
          <SpcPlayer spcUrl={x3Boss} autoStart="mount" hideUi={true} />
      </div>
    </>
  )
}

export default App
