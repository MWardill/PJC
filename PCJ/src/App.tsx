import "./App.css";
import SpcPlayer from "./SpcPlayer";
import gourmetrace from "./assets/songs/gourmetrace.spc";
import RollingSpheres from "./RollingSpheres";
import CatNameFlasher from "./CatNameFlasher";

function App() {
  return (
    <>
      <div className="app-root">
        <RollingSpheres />
        <CatNameFlasher cycleMs={1500} pulseMs={323} />
        <SpcPlayer spcUrl={gourmetrace} autoStart="mount" hideUi={true} />
      </div>
    </>
  );
}

export default App;
