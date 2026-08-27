# おわりに

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse/Conclusion.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse/Conclusion.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

`Traversable` インターフェースとその主要関数 `traverse` は信じられないほど強力な抽象化であり、`Applicative` と `Traversable` がどちらも合成可能であることによってその力はさらに増します。さらなるユースケースに興味がある方は、Haskell に `Traversable` を導入した論文 [The Essence of the Iterator Pattern](https://www.cs.ox.ac.uk/jeremy.gibbons/publications/iterator.pdf) を一読することを強くお勧めします。

*base* ライブラリは `Control.Monad.State` モジュールで拡張版の State モナドを提供しています。これについては後の章でモナド変換子を扱う際に詳しく見ていきます。なお、`IO` 自体も抽象プリミティブ型 `%World` に対する単純な State モナドとして実装されています。

本章で学んだことのまとめ：

- `traverse` 関数は、コンテナのサイズや構造を崩さずに、エフェクトを伴う計算を各要素に対して実行するために使用されます。
- `IO` 内で実行される状態付き計算では、`IORef` を可変参照として利用できます。
- 参照透過性を保ったまま「状態変更」をシミュレートするには、`State` モナドが極めて有用です。
- アプリカティブファンクタは合成可能であるため、1 回の走査で複数のエフェクトを同時に実行できます。
- Traversable も合成可能であるため、入れ子になったコンテナ構造に対しても `traverse` を適用できます。

これで `Functor`, `Applicative`, `Monad` から始まり、`Foldable`, `Traversable` と続いた *Prelude* の高階カインドインターフェースの解説は一段落です（`Alternative` は後の章で扱います）。次は、依存型のさらなる深み（依存ペア型 `DPair` など）へと進んでいきます。

