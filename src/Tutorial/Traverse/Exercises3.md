# エフェクトを伴う走査 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

*Prelude* は、`Either` や `Pair` のように **2 つ** の型パラメータを持つコンテナ型向けに、`Bifunctor`, `Bifoldable`, `Bitraversable` という 3 つの追加インターフェースを提供しています。以下の練習問題でこれらを実践してみましょう。

1. CSV 本文だけでなく、CSV ファイル内のコメントタグも解釈したいとします。そのために以下のような `Tagged` データ型を使用します：

   ```idris
   data Tagged : (tag, value : Type) -> Type where
     Tag  : tag -> value -> Tagged tag value
     Pure : value -> Tagged tag value
   ```

   `Tagged` に対する `Functor`, `Foldable`, `Traversable` および `Bifunctor`, `Bifoldable`, `Bitraversable` を実装してください。

2. `Either (List a) (Maybe b)` のように Bifunctor と 2 つの Functor の合成が再び Bifunctor になることを、専用のラッパー型を定義して `Bifunctor`（および `Bifoldable`, `Bitraversable`）を実装することで証明してください。

3. `List (Either a b)` のように Functor と Bifunctor の合成が再び Bifunctor になることを、専用のラッパー型を定義して `Bifunctor`（および `Bifoldable`, `Bitraversable`）を実装することで証明してください。

4. コメントタグと CSV 本文を 1 回の走査で同時にデコードできるように `readCSV` を拡張します。無効なタグを扱うための新しいエラー型を定義します：

   ```idris
   data TagError : Type where
     CE         : CSVError -> TagError
     InvalidTag : (line : Nat) -> (tag : String) -> TagError
     Append     : TagError -> TagError -> TagError

   Semigroup TagError where (<+>) = Append
   ```

   テスト用にカラータグのデータ型を定義します：

   ```idris
   data Color = Red | Green | Blue
   ```

   以下の関数を実装してください（`readColor` はエラー時に現在の行番号を取得する必要がありますが、行番号をインクリメントしてはいけません）：

   ```idris
   readColor : String -> State Nat (Validated TagError Color)

   readTaggedLine : String -> Tagged String String

   tagAndDecodeTE :  (0 ts : List Type)
                  -> CSVLine (HList ts)
                  => String
                  -> State Nat (Validated TagError (HList ts))
   ```

   練習問題 3 のラッパー型、`readColor`、`tagAndDecodeTE` を `bitraverse` と組み合わせて、`readTagged` を実装してください：

   ```idris
   readTagged :  (0 ts : List Type)
              -> CSVLine (HList ts)
              => String
              -> Validated TagError (List $ Tagged Color $ HList ts)
   ```

   REPL で例となる文字列を渡して動作をテストしてください。

