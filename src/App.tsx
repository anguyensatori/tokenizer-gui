import './App.css'
import Tokenizer from './components/Tokenizer'

function App() {
  return (
    <>
      <section id="center">
        <div>
          <h1>Tokenizer</h1>
          <p>Count tokens for any OpenAI model or encoding.</p>
        </div>
        <Tokenizer />
      </section>
    </>
  )
}

export default App
