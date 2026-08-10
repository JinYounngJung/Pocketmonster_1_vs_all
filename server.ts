import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-safe Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", game: "Pokemon Elite Four Challenge" });
});

// Gemini Chat endpoint for Dr. Oak / Battle Coach AI
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGenAI();
    const systemInstruction = `당신은 포켓몬 배틀 최고 권위자인 '오박사'이자 사천왕 도장깨기 전담 AI 배틀 코치입니다.
사용자는 레벨 50 고정 룰의 포켓몬 6마리로 4명의 사천왕(바위/격투, 얼음/물, 고스트/악, 드래곤/불꽃)을 순서대로 격파하는 도장깨기를 진행 중입니다.

당신의 임무:
1. 포켓몬 본가 및 나무위키 데이터에 기반한 정확한 타입 상성(2배, 4배, 0.5배, 0.25배, 0배 무효), 기술 위력, 물리/특수 분류, 특성, 스피드 우선권 등을 친절하고 박진감 넘치게 해설하고 조언합니다.
2. 현재 배틀 상황(사천왕 이름, 상대 포켓몬, 아군 포켓몬, 남은 HP, 날씨, 랭크업 상태 등)이 주어지면 최고의 전술적 선택(약점 찌르기, 교체 타이밍, 랭크업 기술 활용, 상대의 위험한 기술 예측)을 한국어로 명쾌하게 조언하세요.
3. 말투는 포켓몬 박사답게 지혜롭고 친근하며 열정적인 어조("허허! 훌륭한 판단이로구나!", "이 상대는 스피드가 빠르니 주의해야 하네!", "~하는 것을 강력히 추천한다네!")를 사용하세요.
4. 답변은 가독성 좋게 마크다운과 이모지를 적절히 활용하여 핵심 포인트 위주로 간결하면서도 깊이 있게 작성하세요.

${context ? `[현재 배틀 실시간 컨텍스트]\n${context}` : ""}`;

    // Format messages for Gemini API
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "오박사의 조언을 생성하는 데 실패했습니다. 다시 시도해주게!";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: error?.message || "AI 코칭 서비스 연결 중 오류가 발생했습니다.",
      fallback: "상대방의 약점 타입을 공략하고, 유리한 상성의 포켓몬으로 교체해 전투의 주도권을 잡게나!",
    });
  }
});

// Fast matchup analysis endpoint
app.post("/api/gemini/analyze-matchup", async (req, res) => {
  try {
    const { playerPokemon, opponentPokemon, eliteFourName, remainingTeam } = req.body;
    const ai = getGenAI();

    const prompt = `현재 도장깨기 배틀 상황:
- 상대 사천왕: ${eliteFourName}
- 상대 출전 포켓몬: ${opponentPokemon?.name} (타입: ${opponentPokemon?.types?.join("/")})
- 플레이어 현재 포켓몬: ${playerPokemon?.name} (타입: ${playerPokemon?.types?.join("/")}, 남은 HP: ${playerPokemon?.currentHp}/${playerPokemon?.stats?.hp})
- 플레이어 대기 포켓몬: ${remainingTeam?.map((p: any) => `${p.name}(${p.types.join("/")}, HP:${p.currentHp}/${p.stats.hp})`).join(", ")}

위 상황에서 플레이어가 취해야 할 가장 결정적인 3가지 승리 전략(공격 기술 추천, 교체 추천, 상대 위험 기술 주의)을 2~3줄로 매우 핵심적이고 명쾌하게 한국어로 조언해주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "당신은 포켓몬 배틀 챔피언 코치 오박사입니다. 직관적이고 실전적인 전술을 한눈에 알기 쉽게 조언하세요.",
        temperature: 0.4,
      },
    });

    return res.json({ advice: response.text });
  } catch (error: any) {
    console.error("Matchup advice error:", error);
    return res.json({
      advice: "상대 포켓몬의 약점 타입을 찌르는 고위력 기술을 사용하거나, 상대의 강력한 자속기를 반감할 수 있는 포켓몬으로 교체하는 것이 정석일세!",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pokemon Battle League Server running on port ${PORT}`);
  });
}

startServer();
