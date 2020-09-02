import './style.less'
import { Loader } from 'rsuite';

interface Props{
	loading:boolean
}
const Loading = ({loading}:Props)=>{
	if(loading){
	return <div className="form__end" style={{
		marginTop:'10px'
	}}>
	   <Loader size="md" content="Loading..."  />
	</div>
	}
	return null
}

export default Loading;