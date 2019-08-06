import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';
import { elements, renderLoader, clearLoader} from './views/base';

/***************************************************
 * search controller
 ****************************************************/
const state = {};
window.state = state;

const controlSearch = async () => {
  // 1) 获取查询值
  const query = searchView.getInput(); 

  if (query) {
    // 2) 新建搜索对象，并复制给 state
    state.search = new Search(query);

    // 3) UI 控件
    searchView.clearInput();                  // 清除输入框
    searchView.clearRes();                    // 展示搜索结果前，需清除前一次的搜索结果
    renderLoader(elements.searchResList);     // 显示缓冲 UI 控件

    try {
      // 4) 搜索结果添加到全局 state 对象中 （保存搜索数据）
      await state.search.getResults();
  
      // 5) 更新 UI，显示搜索结果
      clearLoader();                                      // 清除缓冲 UI 控件
      searchView.renderResults(state.search.result);      // 显示结果
    } catch (error) {
      alert('Error processing search!');
      clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearRes();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/***************************************************
 * recipe controller
 ****************************************************/
const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');

  if (id) {
    // Prepare UI for change
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // highlight selected
    if (state.search) searchView.highLightSelected(id);

    // Create UI for changes
    state.recipe = new Recipe(id);

    try {
      // Get recipe data and parse ingredient
      await state.recipe.getRecipe();
      state.recipe.parseIngredient();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();    
      clearLoader();  
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        );
      // Render recipe
    } catch(error) {
      console.log(error);
      alert('Errr processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/***************************************************
 * List controller
 ****************************************************/
const controlList = () => {
  // 创造 List 对象
  if (!state.list) state.list = new List();

  // 添加每个 ingredient 到 list UI
  state.recipe.ingredients.forEach(el => {
    // 添加 ingredient 到 state.list
    const item = state.list.addItem(el.count, el.unit, el.ingredient);

    // 更新 UI
    listView.renderItem(item);
  });
};

// 操作 list 点击事件
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // 删除数据
    state.list.deleteItem(id);

    // 删除 UI 
    listView.deleteItem(id);

    // Handle the count update
  } else if (e.target.matches('.shopping__item-value')) {
    // const val = parseFloat(document.querySelector(`[data-itemid="${id}"] input`).value);
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
    console.log(state.list.items)
  }
});

/***************************************************
 * Likes controller
 ****************************************************/

const controlLikes = () => {
  if (!state.likes) state.likes = new Likes();

  const currentID = state.recipe.id;
  
  // state.likes has NOT yet liked current recipe.
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like button
      likeView.toggleLikeBtn(true);
    // Add like to UI list
    likeView.renderLikes(newLike);
  // state.likes HAS liked current recipe
  } else {
    // remove like to the state
    state.likes.deleteLike(currentID);
    // Toggle the like button
    likeView.toggleLikeBtn(false);
    likeView.deleteLikeItem(currentID);
  } 
  likeView.toggleLikeList(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();

  // Restore likes
  state.likes.readStorage();

  // Toggle like menu button
  likeView.toggleLikeList(state.likes.getNumLikes());

  // Render the existing likes
  state.likes.likes.forEach(like => {
    likeView.renderLikes(like);
  });
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);

  } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')) {
    // Add ingredients to shopping list
    controlList();

  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Add recipe to likes list
    controlLikes();
  }
});



