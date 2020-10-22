import React, { useEffect } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Dimensions, VirtualizedList, View, Text, InteractionManager, UIManager, LayoutAnimation, TextInput, ImageBackground } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { get } from './utils/fetch';
import { Post } from './postBodyComponent';
import { Icon } from '@ui-kitten/components';
import { Error } from './error';
const api = 'https://randomuser.me/api/?results=20'

export default function Home({ }) {
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const [searchKey, setSearchKey] = React.useState('');
  const [originalPosts, setOriginalPosts] = React.useState([]);
  const [arrayOfPosts, setPostsData] = React.useState([]);              // Array of posts
  const [totalPages, setTotalPages] = React.useState(0);                 // Total number of pages in the api
  const [currentPage, setCurrentPage] = React.useState(0);               // Current pagianted page for api calling
  const [selectedCard, setSelectedIndex] = React.useState(-1);           // Keeping the index of selected card to expand or do the animations
  const [selectedView, setSelectedView] = React.useState(0);             // Toggle between Tab View and List View
  const [isOffline, setOfflineFlag] = React.useState(false);             // If Offline this will be true 
  const [isLoading, setLoadingFlag] = React.useState(0);                 //This hase 3 states 0 = LoadingHasFinised , 1 = is Loading, 2 = Network error
  let OriginalPosts = []
  useEffect(() => {
    NetInfo.addEventListener(state => {
      checkInternetAndCall(state.isInternetReachable)
    });
  }, []);


  const checkInternetAndCall = (flag) => {
    if (flag) {
      setOfflineFlag(false)
      getPosts(currentPage + 1);
    } else {
      if (isOffline == false) {
        setLoadingFlag(0);
        setOfflineFlag(true)
      }
    }
  }
  const getPosts = () => {
    //setLoadingFlag(0);
    get({
      url: api,
    })()
      .then(response => {
        if (response != undefined) {
          setLoadingFlag(1);
          InteractionManager.runAfterInteractions(() => {
            setPostsData(arrayOfPosts.concat(response.data.results));
            setOriginalPosts(arrayOfPosts.concat(response.data.results));
            // if (totalPages == 0) {
            //   setTotalPages(response.data.pages);
            // }
            // setCurrentPage(id);
          })
        } else {
          setLoadingFlag(2)
        }
      })
      .catch(error => {
        setLoadingFlag(2);
        console.log(error)
      });
  }
  const getItem = (data, index) => {
    return {
      id: Math.random().toString(12).substring(0),                //Generating Unique ID's
      data: data[index],
      index: index,
      total: data.length                                          //data Object 
    }
  }
  const handleSelected = (index) => {
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedIndex(selectedCard == index ? -1 : index)
  }
  const handleTabClick = (viewIndex) => {
    setSelectedView(viewIndex)
  }
  const handleSearch = (value) => {
    setSearchKey(value)
    setSelectedIndex(-1)
    let temp_list = Array.from(originalPosts);
    setLoadingFlag(1)
    if (value != '') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedView(1)
      temp_list = temp_list.filter((ele, index) => {
        let name = ele.name.first.toLowerCase() + ' ' + ele.name.last.toLowerCase();
        return name.indexOf(value.toLowerCase()) != -1;
      })
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedView(0)
    }
    //alert(JSON.stringify(temp_list))
    setPostsData(temp_list);
  }
  const handleSearchClear = () => {
    setSearchKey('');
    setLoadingFlag(1)
    setSelectedIndex(-1)
    setSelectedView(0)
    setPostsData(Array.from(originalPosts));
  }
  const Tab = ({ id, name, iconName, selected }) => {
    return (
      <TouchableWithoutFeedback onPress={() => handleTabClick(id)}>
        <View style={selected == id ? styles.selectedTab : styles.tab}>
          <Icon fill={selected == id ? '#fff' : '#8A56AC'} style={styles.tabIcon} name={iconName} />
          <Text style={selected == id ? styles.selectedTabText : styles.tabText}>{name}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }


  if (isLoading != 2 && !isOffline) {
    return (
      <ImageBackground source={require('../../images/bg.gif')} style={styles.image}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.inputTag} value={searchKey} onChangeText={value => handleSearch(value)} />
          {searchKey != '' &&
            <TouchableWithoutFeedback onPress={handleSearchClear}>
              <Icon fill='#8A56AC' style={styles.tabIcon} name={'close-square'} />
            </TouchableWithoutFeedback>
          }
        </View>
        <VirtualizedList
          data={isLoading == 0 ? Array.from(' '.repeat(20)) : arrayOfPosts}
          initialNumToRender={4}
          renderItem={({ item }) => <Post  {...item} selectedView={selectedView} handleSelected={(index) => handleSelected(index)} selectedCardIndex={selectedCard} />}
          keyExtractor={item => item.id}
          getItemCount={(data) => data.length}
          getItem={getItem}
          onEndReached={() => {
            if (searchKey == '') {
              getPosts()
            }
          }}
          onEndReachedThreshold={0.5}
        />
        {isLoading == 1 && arrayOfPosts.length == 0 &&
          <View style={styles.noResutlsContainer}>
            <Text style={[styles.noResultsContent]}>Oops we did not find anyone</Text>
          </View>
        }
      </ImageBackground>
    )
  } else {
    return (
      <Error state={isLoading} />
    )
  }
}

const styles = StyleSheet.create({
  noResutlsContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center'
  },
  noResultsContent:{
    color:'white',
    fontSize:20,
    fontWeight:'bold',
    backgroundColor:'#8A56AC',
    paddingVertical:10,
    paddingHorizontal:30,
    borderTopLeftRadius:15,
    borderTopRightRadius:15,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
  inputContainer: {
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'transparent',
    borderRadius: 15,
    backgroundColor: 'white',
    width: '95%',
    padding: 10,
    height: 55,
    margin: 10,
  }, inputTag: {
    paddingLeft: 70,
    textAlign: 'center',
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    fontSize: 15,
    letterSpacing: 1.2,
    color: 'black',
    height: 50
  },
  tabsView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    elevation: 5,
  }, tabIcon: {
    padding: 20,
    width: 30,
    height: 30
  }, tabText: {
    fontWeight: 'bold',
    color: '#8A56AC'
  }, selectedTabText: {
    fontWeight: 'bold',
    color: '#F1F0F2'
  }, tab: {
    backgroundColor: '#F1F0F2',
    flex: 1,
    padding: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: '#8A56AC',
    borderWidth: 3,
  }, selectedTab: {
    backgroundColor: '#8A56AC',
    flex: 1,
    padding: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: '#8A56AC',
    borderWidth: 3,
    elevation: 3
  }
})