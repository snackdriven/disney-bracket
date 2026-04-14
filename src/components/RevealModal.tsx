import type { Movie } from "../types.js";
import { Btn } from "./Btn.js";

interface RevealModalProps {
  myPick: number | null;
  theirPick: number | null;
  theirName: string;
  myName: string;
  players: [Movie, Movie];
  onResolve: (winner: Movie) => void;
  onCancel?: () => void;
}

export function RevealModal({
  myPick,
  theirPick,
  theirName,
  myName,
  players,
  onResolve,
  onCancel,
}: RevealModalProps) {
  // If we haven't both picked yet, just show waiting.
  if (!myPick || !theirPick) {
    if (myPick && !theirPick) {
      return (
        <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center p-4">
          <div className="text-[#ce93d8] text-[20px] mb-4 animate-pulse font-bold">
            Waiting for {theirName} to choose...
          </div>
          {onCancel && <Btn mob={false} s mu onClick={onCancel}>Cancel Pick</Btn>}
        </div>
      );
    }
    return null;
  }

  const myMovie = players.find((p) => p.seed === myPick)!;
  const theirMovie = players.find((p) => p.seed === theirPick)!;

  const isMatch = myMovie.seed === theirMovie.seed;

  return (
    <div className="fixed inset-0 bg-black/85 z-[200] flex flex-col items-center justify-center p-4 animate-[su_0.3s_ease-out]">
      <h2 className="text-[32px] font-extrabold text-[#fff] mb-[40px] tracking-[4px] uppercase text-center" style={{ fontFamily: "'Outfit',sans-serif" }}>
        {isMatch ? "Great Minds Think Alike!" : "We Have A Disagreement!"}
      </h2>

      <div className="flex gap-[20px] md:gap-[60px] items-center justify-center w-full max-w-[800px]">
        {/* My Pick */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-[#8080a0] text-[14px] uppercase tracking-[2px] mb-4 font-bold">{myName} (You)</div>
          <div className="bg-[#1a1a2e] border-2 border-[#4fc3f7] rounded-[16px] p-[20px] w-full aspect-[2/3] flex flex-col justify-end relative overflow-hidden shadow-[0_0_30px_rgba(79,195,247,0.3)]">
             <div className="font-extrabold text-[#fff] text-[24px] z-10 drop-shadow-md text-center">{myMovie.name}</div>
          </div>
          {!isMatch && (
            <div className="mt-6">
              <Btn mob={false} s onClick={() => onResolve(theirMovie)}>
                {theirName} was right!
              </Btn>
            </div>
          )}
        </div>

        {!isMatch && (
            <div className="font-extrabold text-[#ff7070] text-[32px] tracking-[4px]">VS</div>
        )}

        {/* Their Pick */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-[#8080a0] text-[14px] uppercase tracking-[2px] mb-4 font-bold">{theirName}</div>
          <div className="bg-[#1a1a2e] border-2 border-[#ce93d8] rounded-[16px] p-[20px] w-full aspect-[2/3] flex flex-col justify-end relative overflow-hidden shadow-[0_0_30px_rgba(206,147,216,0.3)]">
             <div className="font-extrabold text-[#fff] text-[24px] z-10 drop-shadow-md text-center">{theirMovie.name}</div>
          </div>
          {!isMatch && (
             <div className="mt-6">
              <Btn mob={false} s onClick={() => onResolve(myMovie)}>
                I was right!
              </Btn>
            </div>
          )}
        </div>
      </div>

      {isMatch && (
        <div className="mt-[60px]">
          <Btn mob={false} s onClick={() => onResolve(myMovie)}>
            Advance {myMovie.name}
          </Btn>
        </div>
      )}
    </div>
  );
}
