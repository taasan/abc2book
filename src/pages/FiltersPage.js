import YourFilters from '../components/YourFilters'

export default function FiltersPage(props) {
    return <div style={{padding:'1em'}}>
        <h4>Your Filters</h4>
    <YourFilters {...props} setGroupBy={props.setGroupBy} />
    </div>
}
