import './style.less'

interface Props{
	loading:boolean
}
const Loading = ({loading}:Props)=>{
	if(loading){
	return <div className="modal">
	   <div className="modal__container">
	   <div className="revolver">
		  <section className="revolver__part"></section>
		  <section className="revolver__part"></section>
		  <section className="revolver__part"></section>
		  <section className="revolver__part"></section>
		  <section className="revolver__part"></section>
		  <section className="revolver__part"></section>
		</div>
		<h5>Loading....</h5>
	   </div>
	   </div>
	}
	return null
}

export default Loading;