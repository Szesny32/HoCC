import React, { useEffect, useState } from 'react';
import './Gamepad.css';

type GamepadData = {
  id: string;
  buttons: number[];
  axes: number[];
};

type GamepadButton = {
    id: number;
    value: number;
    image: string;
}



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
const GamepadViewer: React.FC = () => {
  const [gamepad, setGamepad] = useState<GamepadData | null>(null);

  useEffect(() => {
    const updateGamepad = () => {
      const pads = navigator.getGamepads();
      const pad = pads[0];
      if (pad) {
        setGamepad({
          id: pad.id,
          buttons: pad.buttons.map(b => b.value),
          axes: [...pad.axes],
        });
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
    });

    return () => {
      window.removeEventListener("gamepadconnected", updateGamepad);
      window.removeEventListener("gamepaddisconnected", () => {});
    };
  }, []);

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {gamepad ? (
        <div>
          <h2>{gamepad.id}</h2>
          <div>
            <div className="container">
                <img src="/gamepad-3.png" alt="Gamepad" className="gamepad" />
                {
                    gamepadButtons.map((button) => (
                    <img
                        key={button.id}
                        src={button.image} 
                        alt={`${button.image}`}
                        className={`button ${gamepad.buttons[button.id] == 1 ? "active-button" : ""}`}
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
                                className={`button ${gamepad.buttons[button.id] == 1 || isStickerMoved(axisX, axisY) ? "active-button" : ""}`}
                                style={{
                                    left: `${left}px`,
                                    top: `${top}px`
                                }}
                            />
                        );
                    })
                }
            </div>
          </div>
        </div>
      ) : (<p>Podłącz gamepada i naciśnij przycisk, aby rozpocząć.</p>)}
    </div>
  );
};

export default GamepadViewer;