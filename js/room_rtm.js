let handleMemberJoined = async (memberId)=> {
    console.log('member joined:', memberId)
    addMemberToDom(memberId)

    let members=await channel.getMembers()
    updateMemberTotal(members)

    let {name} = await rtmClient.getUserAttributesByKeys(memberId, ['name'])  
    addBotMessageToDom(`Welcome to the room ${name}👋`)
}

let handleMemberLeft = async (memberId)=> {
    console.log('member left:', memberId)
    removeMemberToDom(memberId)

    let members=await channel.getMembers()
    updateMemberTotal(members)
    
}

let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count')

    total.innerText=members.length
}

let addMemberToDom = async (memberId) => {
    let {name} = await rtmClient.getUserAttributesByKeys(memberId, ['name'])  
    let membersWrapper=document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${memberId}__wrapper">
                            <span class="green__icon"></span>
                            <p class="member_name">${name}</p>
                      </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

let removeMemberToDom = async (memberId) => {
    let memberWrapper = document.getElementById(`member__${memberId}__wrapper`)
    let name = memberWrapper.getElementsByClassName('member_name')[0].innerText
    memberWrapper.remove()

    addBotMessageToDom(`${name} has left the room`)
}

let getMembers = async () => {
    let members = await channel.getMembers()
    updateMemberTotal(members)
    for(let i=0; i<members.length; i++){
        addMemberToDom(members[i])
    }
}

let sendMessage = async (e) => {
    e.preventDefault()

    let message = e.target.message.value
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName})})
    addMessageToDom(displayName, message)
    e.target.reset()

}

let handleChannelMessage = async (MessageData, MembersId) => {
    console.log('channel message:')
    let data=JSON.parse(MessageData.text)
    if(data.type==='chat'){
        addMessageToDom(data.displayName, data.message)
    }

    if(data.type==='user_left'){
        document.getElementById(`user-container-${data.uid}`).remove()

        if(userIdInDisplayFrame===`user-container-${uid}`){
            displayFrame.style.display=null
    
            for(let i = 0; videoFrames.length > i; i++){
                videoFrames[i].style.height = '300px'
                videoFrames[i].style.width = '300px'
            }
        }
    }
}

let addMessageToDom = async (name, message) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage=`<div class="message__wrapper">
    <div class="message__body">
            <strong class="message__author">${name}</strong>
            <p class="message__text">${message}</p>
        </div>
    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)
    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}

let addBotMessageToDom = async (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage=`<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Mumble Bot</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)
    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}

let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

window.addEventListener('beforeunload', leaveChannel)
let messageForm= document.getElementById('message__form')
messageForm.addEventListener('submit', sendMessage)