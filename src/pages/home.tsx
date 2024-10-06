import { useState, useRef, useEffect } from "react";
import axios from "redaxios";
import { Box, Button, Typography } from "@mui/joy";
import { RecordType, resultTextAtom } from "../store/atom_record";
import { useAtom } from "jotai";
import MicIcon from "@mui/icons-material/Mic";
import BlockIcon from "@mui/icons-material/Block";

const AudioRecorder = () => {
  // 録音中かどうかの状態を管理する
  const [isRecording, setIsRecording] = useState(false);
  // 録音した音声のURLを管理する。今回は音声データを再生しないので、audioURLは不使用。
  const [audioURL, setAudioURL] = useState("");
  // MediaRecorderの参照を保持する
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // 録音した音声データのチャンクを保持する
  const audioChunksRef = useRef<Blob[]>([]);
  // 音声認識結果の状態を管理する
  const [resultText, setResultText] = useAtom(resultTextAtom);

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
    // 録音が停止したときの処理
    mediaRecorderRef.current.onstop = async () => {
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
        const response = await axios.post("http://localhost:3004/api/v1/transcription", formData);
        // const response = await axios.post("http://localhost:3004/api/v1/transcription/conversation", formData);
        // 音声認識結果を状態に保存する
        // setResultText([...resultText, ...response.data]);
        setResultText([...resultText, response.data]);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    };
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
      // 録音中の状態を解除する
      setIsRecording(false);
    }
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

        {/* <Box sx={{ visibility: "none" }}>{<audio controls src={audioURL} />}</Box> */}

        <Box>
          <Typography>音声認識結果</Typography>
          <Typography gutterBottom>ここに音声認識の結果が表示されます。</Typography>
          {resultText.map((x: RecordType, index: number) => (
            <Typography key={x?.recordId} component={"div"} gutterBottom>
              <div>{x?.createAt}</div>
              <div>{x?.recordText}</div>
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AudioRecorder;