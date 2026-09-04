# シグマ型 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DPair/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DPair/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

依存ペアと依存レコードを扱うスキルを磨きましょう！ 練習問題 2〜7 では、関数が依存ペアやレコードを返すべきか、パターンマッチのための追加引数が必要かなどを自分で判断して設計します。

1. `Acid1` から `Acid2` への可逆な変換関数（およびその逆）を実装して、3 つのエンコーディングが **同型（isomorphic）** であることを証明してください。同様に `Acid1` と `Acid3` についても実装してください。

2. 核酸の配列は 2 つの方向（[**センスとアンチセンス**](https://ja.wikipedia.org/wiki/%E3%82%BB%E3%83%B3%E3%82%B9_(%E5%88%86%E5%AD%90%E7%94%9F%E7%89%A9%E5%AD%A6))）のいずれかでエンコードされます。配列の向きを表す新しいデータ型を宣言し、`Nucleobase`、`DNA`、`RNA` の型パラメータに追加してください。

3. `complement`（相補鎖）および `transcribe`（転写）の型を洗練し、センスの変化が型に反映されるようにしてください（`transcribe` ではアンチセンス DNA 鎖がセンス RNA 鎖に変換されます）。

4. 塩基型とセンスを配列とともに保持する依存レコードを定義してください。

5. `readRNA` と `readDNA` を拡張し、文字列からセンスを読み取れるようにしてください（センス鎖は `"5´-CGGTAG-3´"`、アンチセンス鎖は `"3´-CGGTAG-5´"` のようにエンコードされます）。

6. `encode` を拡張し、センスを出力に含めるようにしてください。

7. `getNucleicAcid` と `transcribeProg` を拡張し、センスと塩基型が配列とともに保持され、`transcribeProg` が常に（必要に応じて転写を行った上で）**センス** RNA 鎖を出力するようにしてください。

8. REPL でプログラムをテストして動作を確認してください。

