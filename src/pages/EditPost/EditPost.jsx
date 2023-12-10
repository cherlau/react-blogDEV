import styles from './EditPost.module.css'
import { useState, useEffect } from 'react'
import { useNavigate, useParams} from 'react-router-dom'
import { useAuthValue } from '../../context/AuthContext'
import { useFetchDocument } from '../../hooks/useFetchDocument'
import { useUpdateDocument } from '../../hooks/useUpdateDocument'

const EditPost = () => {
  const {id} = useParams()
  const {document: post } = useFetchDocument("posts", id)

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {

    if(post){
      setTitle(post.title)
      setBody(post.body)
      setImage(post.image)

      const textTags = post.tagsArray.join(" ")

      setTag(textTags)
    }
  }, [post])

  const {user} = useAuthValue()

  const {updateDocument, response} = useUpdateDocument("posts")

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("")

    // validate image URL
    try {
      new URL(image)
    } catch (error) {
      setFormError("A imagem precisa ser uma URL.")
    }

    // criar o array de tags

    const tagsArray = tag.split(" ").map((tags) => tags.trim().toLowerCase());

    //checar todos os valores
    if(!title || !image || !tag || !body){
      setFormError("Por favor, preencha todos os campos.")
    }

    if(formError) return;

    const data = {
      title,
      image,
      body,
      tagsArray,
      uid: user.uid,
      createBy: user.displayName
    }

    updateDocument(id, data)

    //redirect home page
    navigate("/dashboard")
  }

  return (
    <div className={styles.edit_post}>
      {post && (
        <>
            <h2>Editando post: <br/><span>{post.title}</span></h2>
            <p>Altere os dados do post como desejar</p>
            <form onSubmit={handleSubmit}>
              <label>
                <span>Título:</span>
                <input type="text" 
                name='title' 
                required 
                placeholder='Pense em um bom título...'
                onChange={(e) => setTitle(e.target.value)}
                value = {title}
                />
              </label>
              <label>
                <span>URL da imagem:</span>
                <input type="text" 
                name='image' 
                required 
                placeholder='Insira uma imagem que represente o seu post'
                onChange={(e) => setImage(e.target.value)}
                value = {image}
                />
              </label>
              <p className={styles.preview_title}>Preview da imagem atual:</p>
              <img className={styles.image_preview} src={post.image} alt={post.title} />
              <label>
                <span>Conteúdo:</span>
                <textarea 
                name='body' 
                required 
                placeholder='Insira o contúdo do post' 
                onChange={(e) => setBody(e.target.value)}
                value={body}
                />
              </label>
              <label>
                <span>Tags:</span>
                <input 
                type="text" 
                name='tags' 
                required 
                placeholder='Insira as tags separas por vírgula'
                onChange={(e) => setTag(e.target.value)}
                value = {tag}
                />
              </label>
              {!response.loading && <button className='btn'>Editar</button>}
              {response.loading && (
                <button className='btn' disabled>
                  Aguarde...
                  </button>
              )}
              {response.error && <p className='error'>{response.error}</p>} 
              {formError && <p className='error'>{formError}</p>} 
            </form>
        </>
      )}
    </div>
  )
}

export default EditPost