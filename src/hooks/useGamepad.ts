import { useEffect, useRef } from 'react';
import { Direction, ActionButton } from '../types';

interface GamepadHandlers {
  startCharge: (dir: Direction) => void;
  cancelCharge: () => void;
  executeAction: (btn: ActionButton) => void;
}

export function useGamepad(inputMode: string, handlers: GamepadHandlers, active: boolean) {
  const reqRef = useRef<number>();
  const stateRef = useRef({
    dir: 'NONE' as Direction,
    buttons: { A: false, B: false, X: false, Y: false }
  });

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!active) return;
    if (!inputMode.startsWith('gamepad_')) return;

    const playerIndex = parseInt(inputMode.split('_')[1], 10);

    const pollGamepad = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = pads[playerIndex];
      
      if (pad) {
        let newDir: Direction = 'NONE';
        if (pad.buttons[12]?.pressed || pad.axes[1] < -0.5) newDir = 'UP';
        else if (pad.buttons[13]?.pressed || pad.axes[1] > 0.5) newDir = 'DOWN';
        else if (pad.buttons[14]?.pressed || pad.axes[0] < -0.5) newDir = 'LEFT';
        else if (pad.buttons[15]?.pressed || pad.axes[0] > 0.5) newDir = 'RIGHT';

        if (newDir !== stateRef.current.dir) {
          if (newDir === 'NONE') {
            handlersRef.current.cancelCharge();
          } else {
            handlersRef.current.startCharge(newDir);
          }
          stateRef.current.dir = newDir;
        }

        const checkBtn = (idx: number, name: ActionButton) => {
          const pressed = pad.buttons[idx]?.pressed;
          if (pressed && !stateRef.current.buttons[name]) {
            handlersRef.current.executeAction(name);
          }
          stateRef.current.buttons[name] = pressed;
        };

        checkBtn(0, 'A');
        checkBtn(1, 'B');
        checkBtn(2, 'X');
        checkBtn(3, 'Y');
      }

      reqRef.current = requestAnimationFrame(pollGamepad);
    };

    reqRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [inputMode, active]);
}
