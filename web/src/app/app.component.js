export const AppComponent = {
    template: `
    <div id="wrapper">
    
        <main-nav></main-nav>
        
        <div id="page-wrapper" class="gray-bg">
        
            <top-nav></top-nav>
            
            <div class="wrapper wrapper-content animated fadeIn" ui-view></div>
            
            <footer></footer>
        </div>
    
  `
};