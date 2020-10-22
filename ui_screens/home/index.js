import React, { useEffect } from 'react';
import { StyleSheet, TouchableWithoutFeedback, VirtualizedList, View, Text, InteractionManager, UIManager, LayoutAnimation, TextInput, ImageBackground, Platform } from 'react-native';
import NetInfo from "@react-native-community/netinfo";

import { get } from './utils/fetch';                                     // Re-usable Function to get DATA from Restful API's
import { Post } from './postBodyComponent';                              // Each Card Component
import { Error } from './error';                                         // Error Component Handles UI on Internet or Bad Response

import { Icon } from '@ui-kitten/components';                            // 3rd party UI Component for Icons.   


const api = 'https://randomuser.me/api/?results=20'                      // API url

export default function Home({ }) {

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const [searchKey, setSearchKey] = React.useState('');                  // Search Key Value
  const [originalPosts, setOriginalPosts] = React.useState([]);          // Array of Cards which is used in the case of Search
  const [arrayOfPosts, setPostsData] = React.useState([]);               // Array of Contacts
  const [selectedCard, setSelectedIndex] = React.useState(-1);           // Keeping the index of selected card to expand or do the animations
  const [selectedView, setSelectedView] = React.useState(0);             // Toggle between Tab View and List View
  const [isOffline, setOfflineFlag] = React.useState(false);             // If Offline this will be true 
  const [isLoading, setLoadingFlag] = React.useState(0);                 // This hase 3 states 0 = LoadingHasFinised , 1 = is Loading, 2 = Network error

  useEffect(() => {
    NetInfo.addEventListener(state => {
      checkInternetAndCall(state.isInternetReachable)
    });
  }, []);
  const checkInternetAndCall = (flag) => {                               // Handles whether to call the API or display Error componet
    if (flag) {
      setOfflineFlag(false)
      getPosts();
    } else {
      if (isOffline == false) {
        setLoadingFlag(0);
        setOfflineFlag(true)
      }
    }
  }
  const getPosts = () => {                                               // Hits API and gets New Contacts that are pushed to the UI
    get({
      url: api,
    })()
      .then(response => {
        if (response != undefined) {
          setLoadingFlag(1);
          InteractionManager.runAfterInteractions(() => {
            setPostsData(arrayOfPosts.concat(response.data.results));
            setOriginalPosts(arrayOfPosts.concat(response.data.results));
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
  const getItem = (data, index) => {                                     // For Virtualized Cards
    return {
      id: Math.random().toString(12).substring(0),                //Generating Unique ID's
      data: data[index],
      index: index,
      total: data.length                                          //data Object 
    }
  }
  const handleSelected = (index) => {                                    // Callback when Clicked on a card
    setSelectedIndex(selectedCard == index ? -1 : index)
  }
  const handleSearch = (value) => {                                      // Handles Searching the Contacts                  
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
  const handleSearchClear = () => {                                      // Handles Clearing of Searched items
    setSearchKey('');
    setLoadingFlag(1)
    setSelectedIndex(-1)
    setSelectedView(0)
    setPostsData(Array.from(originalPosts));
  }
  const BG_img = require('../../images/bg.gif');                         // Backgroung Image

  if (isLoading != 2 && !isOffline) {                                    // This is True when there are no errors and we can shoe the Cards
    return (
      <ImageBackground source={BG_img} style={styles.image}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.inputTag} value={searchKey} onChangeText={value => handleSearch(value)} />
          {searchKey != '' &&                                            // Displayed only when the user Searches
            <TouchableWithoutFeedback onPress={handleSearchClear}>
              <Icon fill='#8A56AC' style={styles.tabIcon} name={'close-square'} />
            </TouchableWithoutFeedback>
          }
        </View>
        <VirtualizedList                                                 // if the Loading is 0, we are showing empty cards
          data={isLoading == 0 ? Array.from(' '.repeat(20)) : arrayOfPosts}     // and if Loading is not 0 we are showing actual Cards
          initialNumToRender={4}
          renderItem={({ item }) => <Post {...item} selectedView={selectedView} handleSelected={(index) => handleSelected(index)} selectedCardIndex={selectedCard} />}
          keyExtractor={item => item.id}
          getItemCount={(data) => data.length}
          getItem={getItem}
          onEndReached={() => {
            if (searchKey == '') {                                       // this will call the API for the next list of contacts only when the use is not searching
              getPosts()
            }
          }}
          onEndReachedThreshold={0.5}
        />
        {isLoading == 1 && arrayOfPosts.length == 0 &&                   // If the user searched for a name which is not there, this will become true
          <View style={styles.noResutlsContainer}>
            <Text style={[styles.noResultsContent]}>Oops we did not find anyone</Text>
          </View>
        }
      </ImageBackground>
    )
  } else {                                                               // This will show the Error Component if we encounter a error
    return (
      <Error state={isLoading} />
    )
  }
}

const styles = StyleSheet.create({
  noResutlsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  noResultsContent: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#8A56AC',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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