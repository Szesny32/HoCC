import React, { useEffect, useState, useRef } from 'react';
import './Gamepad.css';

type GamepadButton = {
    id: number;
    value: number;
    image: string;
}

type BodyRaw = {
    ENA: number;
    IN1: boolean;
    IN2: boolean;
    ENB: number;
    IN3: boolean;
    IN4: boolean;
}


const GamepadViewer: React.FC = () => {
  
  const [gamepad, setGamepad] = useState<Gamepad | null>(null);
  const [ENA, setENA] = useState(200);
  const [ENB, setENB] = useState(200);

  const gamepadRef = useRef<Gamepad | null>(null);

  const refENA = useRef(ENA);
  const refENB = useRef(ENB);

  const intervalTime = 100;
  const maxPower = 255;
  const url = 'http://192.168.1.40/';


  const toggleRef = useRef<boolean>(false);
  const [toggle, setToggle] = useState<boolean>(false);

   

  const gamepadButtons: GamepadButton[] = [
      { id: 0, value: 0, image: "/circle-button-down.png" },
      { id: 1, value: 0, image: "/circle-button-right.png" },
      { id: 2, value: 0, image: "/circle-button-left.png" },
      { id: 3, value: 0, image: "/circle-button-up.png" },
      { id: 4, value: 0, image: "/L1.png" },
      { id: 5, value: 0, image: "/R1.png" },
      { id: 6, value: 0, image: "/L2.png"},
      { id: 7, value: 0, image: "/R2.png"},
      { id: 8, value: 0, image: "/mini-button-left.png" },
      { id: 9, value: 0, image: "/mini-button-right.png" },

      { id: 12, value: 0, image: "button-up.png" },
      { id: 13, value: 0, image: "button-down.png" },
      { id: 14, value: 0, image: "button-left.png" },
      { id: 15, value: 0, image: "button-right.png" },
      //{ id: 16, value: 0, image: "" }
  ];
  const gamepadStickers: GamepadButton[] = [
    { id: 10, value: 0, image: "/left-stick.png" },
    { id: 11, value: 0, image: "/right-stick.png" },
  ];

  const isStickerMoved = (x :number, y:number, threshold = 0.01) => {
      return Math.abs(x) > threshold || Math.abs(y) > threshold;
  };

  const sendRequest = async (url : string, bodyRaw : BodyRaw ) => {
    console.log("sendRequest " + url);
    try {
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyRaw),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      //const data = await response.json();
      //console.log('Response:', data);
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  useEffect(() => {
    const updateGamepad = () => {
      const pads = navigator.getGamepads();
      const pad = pads[0];
      if (pad) {
        setGamepad(pad);
        gamepadRef.current = pad;
      } else {
        setGamepad(null);
        gamepadRef.current = null;
      }
      requestAnimationFrame(updateGamepad);
    };

    window.addEventListener("gamepadconnected", () => {
      console.log("Gamepad connected!");
      updateGamepad();
    });

    window.addEventListener("gamepaddisconnected", () => {
      console.log("Gamepad disconnected!");
      setGamepad(null);
      gamepadRef.current = null;
    });

    return () => {
      window.removeEventListener("gamepadconnected", updateGamepad);
      window.removeEventListener("gamepaddisconnected", () => {});
    };
  }, []);


   useEffect(() => {
    const interval = setInterval(() => {
      if(gamepadRef.current){
        let inputs: boolean[] = [false, false, false, false];

        const axisY = gamepadRef.current.axes[1];
        const axisX = gamepadRef.current.axes[0];

          if (axisY > 0.01)
            inputs = [false, true, false, true];
          else if (axisY < -0.01)
            inputs = [true, false, true, false];
          //else if (axisX < -0.1)
           // inputs = [false, true, false, false];
         // else if (axisX > 0.1)
           // inputs = [false, false, false, true];
          else
            inputs = [false, false, false, false];

        const power = Math.abs(axisY);
        let newENA = 0;
        let newENB = 0;


        if (axisX > 0.1) {
          newENA = Math.round(maxPower * axisX);
          newENB = Math.round(maxPower * power);
        } else if (axisX < -0.1) {
          newENA = Math.round(maxPower * power);
          newENB = Math.round(maxPower * -axisX);
        } else {
          newENA = Math.round(maxPower * power);
          newENB = Math.round(maxPower * power);
        }


        setENA(newENA);
        setENB(newENB);
        refENA.current = newENA;
        refENB.current = newENB;

        const bodyRaw: BodyRaw = {
          ENA: newENA,
          IN1: inputs[0],
          IN2: inputs[1],
          ENB: newENB,
          IN3: inputs[2],
          IN4: inputs[3]
        }

        //console.log(bodyRaw);

       if(toggleRef.current) sendRequest(url, bodyRaw);
      }
    }, intervalTime); 

    return () => clearInterval(interval); 
  }, [gamepad == null]); 


  return (
    <div style={{ fontFamily: 'monospace' }}>
      {gamepad ? (
        <div>
          <h2>{gamepad.id}</h2>
          <div>
            <div className="container">
                <img src="/gamepad-3.png" alt="Gamepad" className="gamepad" />
                {
                    gamepadButtons.map((button,) => (
                    <img
                        key={button.id}
                        src={button.image} 
                        alt={`${button.image}`}
                        className={`button ${gamepad.buttons[button.id].pressed  ? "active-button" : ""}`}
                    />
                    ))
                }

                {
                    gamepadStickers.map((button) => {
                        const axisX = gamepad.axes[(button.id - 10) * 2 + 0] || 0;
                        const axisY = gamepad.axes[(button.id - 10) * 2 + 1] || 0;
                        const left = 3 * axisX;
                        const top = 3 * axisY;

                        return (
                 
                            <img 
                                key={button.id}
                                src={button.image}
                                alt={button.image}
                                className={`button ${gamepad.buttons[button.id].pressed || isStickerMoved(axisX, axisY) ? "active-button" : ""}`}
                                style={{
                                    left: `${left}px`,
                                    top: `${top}px`
                                }}
                              />
                        );
                    })
                }
            </div>
              <table>
                <thead>
                  <tr>
                    <th>Left-X</th> 
                    <th>Left-Y</th> 
                    <th>Right-X</th> 
                    <th>Right-Y</th> 
                  </tr>
                </thead>

                <tbody>
                  <tr>
                {gamepad.axes.map((ax, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2">{ax.toFixed(2)}</td>
                ))}
                 </tr>
              </tbody>
              </table>


                <div style={{ width: '300px', margin: '2rem auto', textAlign: 'center' }}>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={ENA}
                    onChange={(e) => 
                      {
                        setENA(Number(e.target.value));
                        refENA.current = ENA;
                      }

                     }
                    style={{ width: '100%' }}
                  />
                  <p>Wartość: {ENA}</p>
                </div>

                <div style={{ width: '300px', margin: '2rem auto', textAlign: 'center' }}>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={ENB}
                    onChange={(e) => {
                        setENB(Number(e.target.value));
                        refENB.current = ENB;
                      }}
                    style={{ width: '100%' }}
                  />
                  <p>Wartość: {ENB}</p>
                </div>

                <button
                  onClick={() => toggleRef.current = ! toggleRef.current}    
                  style={toggleRef.current  ? { backgroundColor: 'green' } : { backgroundColor: 'red' }}>
                   {toggleRef.current ? "active sending" : "request paused"}
                </button>
                
       
          </div>

        </div>
    

      ) : (<p>Podłącz gamepada i naciśnij przycisk, aby rozpocząć.</p>)}
    </div>
  );
};

export default GamepadViewer;