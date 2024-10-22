import { useState, useRef, useEffect } from "react";
import axios from "redaxios";
import { Box, Button, IconButton, Typography } from "@mui/joy";
import { RecordType, resultTextAtom } from "../store/atom_record";
import { useAtom } from "jotai";
import MicIcon from "@mui/icons-material/Mic";
import BlockIcon from "@mui/icons-material/Block";
import ClearIcon from "@mui/icons-material/Clear";
import AvTimerIcon from "@mui/icons-material/AvTimer";

const url = import.meta.env.VITE_API_URL as string;

const AudioRecorder = () => {
  // 録音中かどうかの状態を管理する
  const [isRecording, setIsRecording] = useState(false);
  // 録音した音声のURLを管理する。今回は音声データを再生しないので、audioURLは不使用。
  const [, setAudioURL] = useState("");
  // MediaRecorderの参照を保持する
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // 録音した音声データのチャンクを保持する
  const audioChunksRef = useRef<Blob[]>([]);
  // 音声認識結果の状態を管理する
  const [resultText, setResultText] = useAtom(resultTextAtom);

  // 録音時間を管理する
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initialFunction = async () => {
      try {
        if (navigator.mediaDevices) {
          // ユーザーのメディアデバイスにアクセスする
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          console.error("getUserMedia not supported on this browser.");
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };
    initialFunction();
  }, []);

  // 録音を開始する関数
  const startRecording = async () => {
    // ユーザーのオーディオデバイスにアクセスする
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // MediaRecorderを初期化する
    mediaRecorderRef.current = new MediaRecorder(stream);
    // 録音データが利用可能になったときの処理
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    // タイマーを開始する
    timerRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
    // 録音を開始する
    mediaRecorderRef.current.start();
    // 録音中の状態に設定する
    setIsRecording(true);
  };

  // 録音を停止する関数
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      // MediaRecorderが存在する場合に録音を停止する
      mediaRecorderRef.current.stop();
      // タイマーをクリアする

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // 録音中の状態を解除する
      setIsRecording(false);

      // 録音が停止したときの処理
      mediaRecorderRef.current.onstop = async () => {
        console.log("stop");
        // 録音データをBlobに変換する
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" });
        // BlobからURLを生成する
        const audioUrl = URL.createObjectURL(audioBlob);
        // 生成したURLを状態に保存する
        setAudioURL(audioUrl);
        // チャンクをリセットする
        audioChunksRef.current = [];

        // サーバーに音声データをアップロードする
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.ogg");

        try {
          // サーバーに音声データを送信する
          const response = await axios.post(`${url}/api/v1/transcription`, formData, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_GEMINI_SERVER_API_KEY}`,
            },
          });
          // 音声認識結果を状態に保存する
          setResultText([...resultText, { ...response.data, recordingTime: recordingTime }]);
          setRecordingTime(0);
        } catch (error) {
          console.error("Upload failed:", error);
        }
      };
    }
  };

  // 録音データを削除する関数
  const deleteRecord = (recordId: string) => {
    // 指定されたrecordIdと一致しない録音データのみを残す
    setResultText(resultText.filter((x) => x.recordId !== recordId));
  };

  return (
    <Box display="flex" justifyContent="center">
      <Box display={"flex"} flexDirection={"column"} justifyContent={"center"} pt={2} gap={4} maxWidth={400}>
        {/* 録音開始ボタン */}
        <Box display="flex" flexDirection="row" gap={1} justifyContent="center">
          <Box width={104}>
            <Button
              startDecorator={<MicIcon />}
              color="primary"
              variant="soft"
              onClick={startRecording}
              disabled={isRecording}
              fullWidth
            >
              開始
            </Button>
          </Box>
          {/* 録音停止ボタン */}
          <Box width={104}>
            <Button
              startDecorator={<BlockIcon />}
              color="danger"
              variant="soft"
              onClick={stopRecording}
              disabled={!isRecording}
              fullWidth
            >
              停止
            </Button>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="center">
          <AvTimerIcon fontSize="small" />
          <Typography>{recordingTime} 秒</Typography>
        </Box>

        {/* <Box sx={{ visibility: "none" }}>{<audio controls src={audioURL} />}</Box> */}

        <Box width={"100%"} display="flex" flexDirection="column" alignItems="flex-start">
          <Typography>音声認識結果</Typography>
          <Typography gutterBottom>ここに音声認識の結果が表示されます。</Typography>
          {resultText.map((x: RecordType) => (
            <Box
              key={x?.recordId}
              component={"div"}
              mb={1}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
            >
              <Box display="flex" alignItems="center">
                <Typography level={"body-xs"} component={"div"}>
                  {x?.createAt}
                  <span style={{ marginLeft: 12 }}>{x.recordingTime}</span>秒
                </Typography>
                <IconButton>
                  <ClearIcon fontSize="small" onClick={() => deleteRecord(x.recordId)} />
                </IconButton>
              </Box>

              <Typography level={"body-sm"} component={"div"}>
                {x?.recordText}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AudioRecorder;
