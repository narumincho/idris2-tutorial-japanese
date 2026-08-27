# 命題的等値性 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

本節の練習問題では、等値性の証明に関する基本的な性質（同値関係）を実装します。

1. `SameColType` が **反射的（reflexive）** な関係であることを示してください。

2. `SameColType` が **対称的（symmetric）** な関係であることを示してください。

3. `SameColType` が **推移的（transitive）** な関係であることを示してください。

4. 任意の型 `a` に対する関数 `f : ColType -> a` について、`SameColType c1 c2` から `f c1 = f c2` が導かれること（**合同性 / congruence**）を示してください。

   標準の等値性 `(=)` に対しては、これらの性質が *Prelude* で `sym`（対称律）、`trans`（推移律）、`cong`（合同律）として提供されています。反射律は `Refl` そのものです。

5. 2 つの自然数が等しいかどうかを検証する関数を実装してください（実装に `cong` を使ってみてください）。

6. 練習問題 5 の関数を使って、行数が一致する場合に 2 つの `Table` を zip（列方向に結合）する関数を実装してください。

   ヒント: `Vect.zipWith` を使用します。`HList.(++)` の型推論を補佐するために、以下のヘルパー関数 `appRows` を実装してください：

   ```idris
   appRows : {ts1 : _} -> Row ts1 -> Row ts2 -> Row (ts1 ++ ts2)
   ```

